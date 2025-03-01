const queryOllama = async (query: string, model: string) => {
  const LLM_URL = process.env.LLM_HOST;

  const response = await fetch(`${LLM_URL}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      prompt: query,
      stream: false,
    }),
  });

  if (!response.ok) {
    throw new Error(`Ollama API error: ${response.statusText}`);
  }

  const {
    response: modelResponse,
    context,
    total_duration: totalDuration,
    load_duration: loadDuration,
    prompt_eval_count: promptEvalCount,
    prompt_eval_duration: promptEvalDuration,
    eval_count: evalCount,
    eval_duration: evalDuration,
  } = await response.json();

  return {
    modelResponse,
    context,
    totalDuration,
    loadDuration,
    promptEvalCount,
    promptEvalDuration,
    evalCount,
    evalDuration,
  };
};

export { queryOllama };
