"use client";

import * as React from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { useToast } from "@/hooks/use-toast";

export function SentenceForm() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);
  const [result, setResult] = React.useState("");
  const [sentence, setSentence] = React.useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setResult("");

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        body: JSON.stringify({ sentence }),
      });

      if (!response.ok) {
        throw new Error("An error occurred.");
      }

      const data = await response.json();
      setResult(data.result);
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while generating the sentence.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          name="sentence"
          placeholder="Enter a sentence to transform"
          value={sentence}
          onChange={(e) => setSentence(e.target.value)}
          required
        />
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Loading..." : "Generate"}
        </Button>
      </form>
      {result && (
        <Textarea
          value={result}
          readOnly
          placeholder="The result will appear here"
          className="min-h-[200px]"
        />
      )}
    </div>
  );
}
