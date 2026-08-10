import { NextRequest, NextResponse } from "next/server";

const API_URL = "https://api.anthropic.com/v1/messages";
const MODEL = "claude-3-5-sonnet-latest";

function buildSystemPrompt(type: string) {
  switch (type) {
    case "reminder":
      return "You are a professional finance operations assistant. Write a concise payment reminder email or message for a client. Use a friendly tone when the client is 0-3 days overdue, and a firm tone when 4+ days overdue. Keep the text warm, brief, and actionable. Include the client name, invoice number, amount, due date, and a clear next step. Do not mention internal tools or system details. Return only the final message text without markdown fences or labels.";
    case "improve-line-item":
      return "You are an expert invoice copywriter. Rewrite vague line-item descriptions into polished, specific, client-friendly billing language. Keep it short, clear, and professional. Focus on business value and services rendered. Return only the improved line item description text with no commentary or markdown.";
    case "proposal":
      return "You are a senior proposal writer for a digital studio. Generate a professional client-facing proposal that matches the structure used in a premium agency proposal: title, client name, executive summary, scope of work, deliverables, timeline, investment, and conversion protocol. Use the supplied tone and keep it polished and persuasive. Return only the final proposal content in plain text, preserving this format: PROPOSAL FOR SERVICES, PROJECT, CLIENT, COMPILED BY, DATE, 1. EXECUTIVE SUMMARY, 2. DETAILED SCOPE OF WORK, 3. PROJECT DELIVERABLES, 4. TIMELINE & ESTIMATED INVESTMENT, and 5. CONVERSION PROTOCOLS. Do not include markdown fences.";
    default:
      return "You are a helpful business assistant.";
  }
}

function buildUserPrompt(type: string, payload: Record<string, unknown>) {
  switch (type) {
    case "reminder": {
      const { clientName, invoiceNumber, amount, dueDate, daysOverdue } =
        payload as {
          clientName?: string;
          invoiceNumber?: string;
          amount?: number;
          dueDate?: string;
          daysOverdue?: number;
        };
      const tone = (daysOverdue ?? 0) >= 4 ? "firm" : "friendly";
      return `Create a ${tone} payment reminder for the following invoice. Client name: ${clientName ?? "Client"}. Invoice number: ${invoiceNumber ?? "INV-000"}. Amount: ₹${amount ?? 0}. Due date: ${dueDate ?? "N/A"}. Days overdue: ${daysOverdue ?? 0}. Keep it brief and polished.`;
    }
    case "improve-line-item": {
      const { description } = payload as { description?: string };
      return `Improve this vague invoice line-item description: "${description ?? ""}". Rewrite it into a clearer, more specific and professional invoice item description.`;
    }
    case "proposal": {
      const { title, client, scope, deliverables, duration, budget, tone } =
        payload as {
          title?: string;
          client?: string;
          scope?: string;
          deliverables?: string;
          duration?: string;
          budget?: string;
          tone?: string;
        };
      return `Generate a proposal document for the following project. Project title: ${title ?? "Project"}. Client: ${client ?? "Client"}. Scope of work: ${scope ?? "Scope details"}. Deliverables: ${deliverables ?? "Deliverables"}. Duration: ${duration ?? "4 weeks"}. Budget: ₹${budget ?? "0"}. Tone: ${tone ?? "Professional"}. Use the format described earlier and keep the content client-ready.`;
    }
    default:
      return "Provide a helpful output based on the request.";
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      type?: string;
      payload?: Record<string, unknown>;
    };
    const type = body.type;
    const payload = body.payload ?? {};

    if (
      !type ||
      !["reminder", "improve-line-item", "proposal"].includes(type)
    ) {
      return NextResponse.json({ error: "Invalid AI type." }, { status: 400 });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "ANTHROPIC_API_KEY is not configured." },
        { status: 500 },
      );
    }

    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 1200,
        system: buildSystemPrompt(type),
        messages: [
          {
            role: "user",
            content: buildUserPrompt(type, payload),
          },
        ],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Anthropic API error:", data);
      return NextResponse.json(
        { error: data?.error?.message ?? "AI generation failed." },
        { status: response.status || 500 },
      );
    }

    const text =
      data?.content
        ?.map((part: { type?: string; text?: string }) =>
          part?.type === "text" ? (part.text ?? "") : "",
        )
        .join("\n")
        .trim() ?? "";

    if (!text) {
      return NextResponse.json(
        { error: "AI returned an empty response." },
        { status: 500 },
      );
    }

    return NextResponse.json({ text });
  } catch (error) {
    console.error("AI route exception:", error);
    return NextResponse.json(
      { error: "Unable to generate AI response right now. Please try again." },
      { status: 500 },
    );
  }
}
