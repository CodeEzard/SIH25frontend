"use client";

import type React from "react";
import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Bug, Lightbulb, Send } from "lucide-react";

export default function SupportSection() {
  const [isSubmittingBug, setIsSubmittingBug] = useState(false);
  const [isSubmittingIdea, setIsSubmittingIdea] = useState(false);

  async function onSubmitBug(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmittingBug(true);
    // TODO: wire to backend endpoint e.g., POST /api/feedback/bug
    await new Promise((r) => setTimeout(r, 1000));
    setIsSubmittingBug(false);
    (e.currentTarget as HTMLFormElement).reset();
    alert("Thanks! Your bug report was submitted.");
  }

  async function onSubmitIdea(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmittingIdea(true);
    // TODO: wire to backend endpoint e.g., POST /api/feedback/suggestion
    await new Promise((r) => setTimeout(r, 1000));
    setIsSubmittingIdea(false);
    (e.currentTarget as HTMLFormElement).reset();
    alert("Thanks for the suggestion! We appreciate your feedback.");
  }

  return (
    <section
      id="support"
      className="relative py-16 md:py-24 border-t border-gray-800/80"
    >
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-10 left-10 h-56 w-56 rounded-full bg-purple-700/10 blur-3xl"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-gray-800/60 bg-gray-900/40 px-3 py-1 text-xs text-gray-300 mb-4">
            <Lightbulb className="h-4 w-4 text-purple-400" />
            Feedback & Improvements
          </div>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
            Help us make VeriCred better
          </h2>
          <p className="text-gray-400 mt-4">
            Found a bug or have an idea? Submit a detailed bug report or share
            suggestions on how to improve the platform.
          </p>
        </motion.div>

        <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Bug Reports */}
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Card className="bg-gray-900/70 border-gray-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-white flex items-center gap-2">
                  <Bug className="h-4 w-4 text-purple-400" />
                  Bug Reports
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={onSubmitBug} className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="text-xs text-gray-400">Title</label>
                    <Input
                      className="mt-1 bg-gray-800 border-gray-700 text-white"
                      placeholder="Short bug summary"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400">
                      Steps to reproduce
                    </label>
                    <Textarea
                      className="mt-1 bg-gray-800 border-gray-700 text-white"
                      rows={4}
                      placeholder="1) Go to… 2) Click… 3) Observe…"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-gray-400">
                        Expected result
                      </label>
                      <Input
                        className="mt-1 bg-gray-800 border-gray-700 text-white"
                        placeholder="What should happen?"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-400">
                        Actual result
                      </label>
                      <Input
                        className="mt-1 bg-gray-800 border-gray-700 text-white"
                        placeholder="What actually happens?"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-gray-400">
                      Additional context or link (optional)
                    </label>
                    <Input
                      className="mt-1 bg-gray-800 border-gray-700 text-white"
                      placeholder="Screenshot URL, wallet, device, etc."
                    />
                  </div>
                  <div>
                    <Button
                      type="submit"
                      disabled={isSubmittingBug}
                      className="bg-white text-black hover:bg-gray-100"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      {isSubmittingBug ? "Submitting…" : "Submit bug report"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          {/* Suggestions */}
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Card className="bg-gray-900/70 border-gray-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-white flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-purple-400" />
                  Suggestions for Improvement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form
                  onSubmit={onSubmitIdea}
                  className="grid grid-cols-1 gap-4"
                >
                  <div>
                    <label className="text-xs text-gray-400">Idea title</label>
                    <Input
                      className="mt-1 bg-gray-800 border-gray-700 text-white"
                      placeholder="E.g., Improve mobile nav"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400">
                      Describe your suggestion
                    </label>
                    <Textarea
                      className="mt-1 bg-gray-800 border-gray-700 text-white"
                      rows={6}
                      placeholder="What should we change and why?"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400">
                      Potential impact (optional)
                    </label>
                    <Input
                      className="mt-1 bg-gray-800 border-gray-700 text-white"
                      placeholder="Who benefits? How much?"
                    />
                  </div>
                  <div>
                    <Button
                      type="submit"
                      disabled={isSubmittingIdea}
                      className="bg-white text-black hover:bg-gray-100"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      {isSubmittingIdea ? "Submitting…" : "Share suggestion"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
