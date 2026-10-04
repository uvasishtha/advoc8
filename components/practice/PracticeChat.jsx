"use client";

import { useEffect, useRef, useState } from "react";
import { RotateCcw, Send, Sparkle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Disclaimer } from "@/components/ui/Notice";
import { roundTo, formatDate } from "@/lib/format";

const OPENING =
  "Imagine you've just sat down with your doctor. In your own words, tell me what's been happening.";

export function PracticeChat({ report, questions, connections }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [error, setError] = useState("");
  const [hasStarted, setHasStarted] = useState(false);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  const lead = report?.symptoms?.[0];

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, isThinking]);

  useEffect(() => {
    if (hasStarted) inputRef.current?.focus();
  }, [hasStarted, isThinking]);

  async function sendTurn(content) {
    const trimmed = content.trim();
    if (!trimmed || isThinking) return;

    const nextMessages = [...messages, { role: "user", content: trimmed }];
    setMessages(nextMessages);
    setInput("");
    setError("");
    setIsThinking(true);

    try {
      const response = await fetch("/api/practice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          report,
          questions,
          connections,
          messages: nextMessages,
          turnIndex: nextMessages.length - 1,
        }),
      });

      if (!response.ok) throw new Error("Request failed");

      const payload = await response.json();
      setMessages((current) => [...current, { role: "assistant", content: payload.reply, stage: payload.stage }]);
    } catch {
      setError("That reply did not come through. Check your connection and try again.");
    } finally {
      setIsThinking(false);
    }
  }

  function restart() {
    setMessages([]);
    setInput("");
    setError("");
    setHasStarted(false);
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_18rem] lg:items-start">
      <Card className="flex min-h-[32rem] flex-col overflow-hidden p-0">
        <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
          <p className="flex items-center gap-2 text-sm font-medium">
            <Sparkle size={15} className="text-accent-strong" aria-hidden="true" />
            Rehearsal
          </p>
          <Button size="sm" variant="ghost" onClick={restart} disabled={messages.length === 0}>
            <RotateCcw size={14} aria-hidden="true" />
            Start over
          </Button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto p-4" aria-live="polite">
          {messages.length === 0 ? (
            <div className="rounded-2xl bg-accent-soft p-4">
              <p className="text-[0.9375rem] leading-relaxed text-foreground">{OPENING}</p>
              <p className="mt-2 text-sm text-muted">
                Answer in your own words, as you would in the room. Nothing you say is saved.
              </p>
            </div>
          ) : null}

          {messages.map((message, index) => (
            <div
              key={index}
              className={message.role === "user" ? "flex justify-end" : "flex justify-start"}
            >
              <div
                className={
                  message.role === "user"
                    ? "max-w-[85%] rounded-2xl rounded-br-md bg-accent-strong px-4 py-2.5 text-[0.9375rem] leading-relaxed text-white"
                    : "max-w-[85%] rounded-2xl rounded-bl-md border border-border bg-secondary-bg px-4 py-2.5 text-[0.9375rem] leading-relaxed text-foreground"
                }
              >
                <span className="sr-only">{message.role === "user" ? "You said: " : "Clinician asked: "}</span>
                {message.content}
              </div>
            </div>
          ))}

          {isThinking ? (
            <div className="flex justify-start">
              <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-md border border-border bg-secondary-bg px-4 py-3">
                <span className="sr-only">Clinician is typing</span>
                <span aria-hidden="true" className="flex gap-1">
                  {[0, 1, 2].map((dot) => (
                    <span
                      key={dot}
                      className="h-1.5 w-1.5 animate-bounce rounded-full bg-accent"
                      style={{ animationDelay: `${dot * 120}ms` }}
                    />
                  ))}
                </span>
              </div>
            </div>
          ) : null}

          {error ? (
            <p role="alert" className="rounded-lg bg-warning-soft px-3 py-2 text-sm text-warning">
              {error}
            </p>
          ) : null}

          <div ref={scrollRef} />
        </div>

        <form
          className="border-t border-border p-3"
          onSubmit={(event) => {
            event.preventDefault();
            sendTurn(input);
          }}
        >
          <label htmlFor="practice-input" className="sr-only">
            Your answer
          </label>
          <div className="flex items-end gap-2">
            <textarea
              id="practice-input"
              ref={inputRef}
              rows={2}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  sendTurn(input);
                }
              }}
              placeholder="Describe what has been happening…"
              className="input-field resize-none"
              disabled={isThinking}
            />
            <Button type="submit" disabled={isThinking || !input.trim()} className="shrink-0">
              <Send size={16} aria-hidden="true" />
              <span className="sr-only">Send answer</span>
            </Button>
          </div>
        </form>
      </Card>

      <aside className="space-y-4 lg:sticky lg:top-6">
        <Card className="p-4">
          <p className="eyebrow">What it can draw on</p>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            This rehearsal only sees numbers from your own Evidence Brief. It has no access to
            medical knowledge, and it will not tell you what you have.
          </p>

          {lead ? (
            <dl className="mt-4 space-y-2 text-sm">
              {[
                ["Lead symptom", lead.name],
                ["First recorded", formatDate(lead.firstSeen)],
                ["Days reported", `${lead.daysReported} of ${report.range.totalDays}`],
                ["Average severity", `${roundTo(lead.avgSeverity)} / 10`],
                ["Highest severity", `${lead.maxSeverity} / 10`],
                [
                  "Average duration",
                  lead.avgDurationMinutes ? `${roundTo(lead.avgDurationMinutes)} min` : "—",
                ],
              ].map(([term, value]) => (
                <div key={term} className="flex justify-between gap-3">
                  <dt className="text-muted">{term}</dt>
                  <dd className="text-right font-medium text-foreground">{value}</dd>
                </div>
              ))}
            </dl>
          ) : null}
        </Card>

        {questions.length > 0 ? (
          <Card className="p-4">
            <p className="eyebrow">Your questions</p>
            <ul className="mt-2 space-y-2">
              {questions.slice(0, 5).map((question, index) => (
                <li key={question.id} className="text-sm leading-relaxed text-foreground">
                  <span className="font-semibold text-accent-strong">{index + 1}.</span> {question.text}
                </li>
              ))}
            </ul>
          </Card>
        ) : null}

        <Disclaimer>
          <Badge tone="accent">Rehearsal only</Badge>
          <p className="mt-2">
            Nothing here is medical advice. If you are unsure about your health, speak to a qualified
            clinician.
          </p>
        </Disclaimer>
      </aside>
    </div>
  );
}