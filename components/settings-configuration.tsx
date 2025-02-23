"use client";

import { useCallback, useEffect, useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  ModelProvider,
  CacheProvider,
  WebSearchProvider,
} from "@prisma/client";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import debounce from "lodash/debounce";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

const settingsFormSchema = z.object({
  id: z.string(),
  guyName: z.string().min(1, "Name is required"),
  embeddingServiceUrl: z.string().url("Must be a valid URL"),
  modelProvider: z.nativeEnum(ModelProvider),
  ollamaUrl: z.string().url("Must be a valid URL"),
  openApiCompatibleApiUrl: z.string().url("Must be a valid URL").nullable(),
  modelApiKey: z.string().nullable(),
  weakModel: z.string().min(1, "Weak model is required"),
  strongModel: z.string().min(1, "Strong model is required"),
  reasoningModel: z.string().min(1, "Reasoning model is required"),
  cacheEnabled: z.boolean(),
  cacheProvider: z.nativeEnum(CacheProvider),
  redisHost: z.string().nullable(),
  redisPort: z.string().nullable(),
  webSearchEnabled: z.boolean(),
  webSearchProvider: z.nativeEnum(WebSearchProvider),
  serperUrl: z.string().url("Must be a valid URL").nullable(),
  serperApiKey: z.string().nullable(),
});

type SettingsFormValues = z.infer<typeof settingsFormSchema>;

interface SettingsConfigurationProps {
  topSaveButtonId?: string;
}

interface Model {
  id: string;
  name: string;
}

export function SettingsConfiguration({
  topSaveButtonId,
}: SettingsConfigurationProps) {
  const router = useRouter();
  const [availableModels, setAvailableModels] = useState<Model[]>([]);
  const [mounted, setMounted] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsFormSchema),
    defaultValues: {
      cacheEnabled: false,
      webSearchEnabled: false,
    },
  });

  const { watch } = form;
  const modelProvider = watch("modelProvider");
  const ollamaUrl = watch("ollamaUrl");
  const openApiCompatibleApiUrl = watch("openApiCompatibleApiUrl");
  const cacheEnabled = watch("cacheEnabled");
  const cacheProvider = watch("cacheProvider");
  const webSearchEnabled = watch("webSearchEnabled");
  const webSearchProvider = watch("webSearchProvider");

  const fetchModels = useCallback(
    async (provider: ModelProvider, overrideUrl?: string) => {
      try {
        const url = new URL("/api/models", window.location.origin);
        url.searchParams.set("provider", provider);
        if (overrideUrl && !isInitialLoad) {
          url.searchParams.set("overrideUrl", overrideUrl);
        }

        const response = await fetch(url);
        if (!response.ok) throw new Error("Failed to fetch models");
        const data = await response.json();
        setAvailableModels(data.models || data);
      } catch (error) {
        console.error("Error fetching models:", error);
        setAvailableModels([]);
      }
    },
    [isInitialLoad]
  );

  // Debounced version of fetchModels for URL changes
  const debouncedFetchModels = useMemo(
    () =>
      debounce((provider: ModelProvider, overrideUrl?: string) => {
        if (!isInitialLoad) {
          fetchModels(provider, overrideUrl);
        }
      }, 500),
    [fetchModels, isInitialLoad]
  );

  // Effect for initial model fetch and provider changes
  useEffect(() => {
    if (modelProvider) {
      if (isInitialLoad) {
        fetchModels(modelProvider);
      } else if (modelProvider === ModelProvider.OLLAMA && ollamaUrl) {
        debouncedFetchModels(modelProvider, ollamaUrl);
      } else if (
        modelProvider === ModelProvider.OPENAI &&
        openApiCompatibleApiUrl
      ) {
        debouncedFetchModels(modelProvider, openApiCompatibleApiUrl);
      } else {
        debouncedFetchModels(modelProvider);
      }
    }
  }, [
    modelProvider,
    ollamaUrl,
    openApiCompatibleApiUrl,
    debouncedFetchModels,
    isInitialLoad,
    fetchModels,
  ]);

  // Clean up debounce on unmount
  useEffect(() => {
    return () => {
      debouncedFetchModels.cancel();
    };
  }, [debouncedFetchModels]);

  const fetchSettings = useCallback(async () => {
    try {
      const response = await fetch("/api/settings");
      if (!response.ok) throw new Error("Failed to fetch settings");
      const settings = await response.json();
      form.reset(settings);

      // After settings are loaded, fetch initial models
      if (settings.modelProvider) {
        await fetchModels(settings.modelProvider);
      }

      // Mark initial load as complete after fetching both settings and models
      setIsInitialLoad(false);
    } catch (error) {
      console.error("Error fetching settings:", error);
      setIsInitialLoad(false);
    }
  }, [form, fetchModels]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  async function onSubmit(data: SettingsFormValues) {
    try {
      const response = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error("Failed to update settings");
      router.refresh();
    } catch (error) {
      console.error("Error updating settings:", error);
    }
  }

  const saveButton = (
    <Button
      type="submit"
      onClick={() => form.handleSubmit(onSubmit)()}
      className="min-w-[100px]"
    >
      Save changes
    </Button>
  );

  const topSaveButtonPortal =
    mounted && topSaveButtonId && document
      ? createPortal(saveButton, document.getElementById(topSaveButtonId)!)
      : null;

  const modelField = (
    name: "weakModel" | "strongModel" | "reasoningModel",
    label: string,
    description: string
  ) => (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <Select onValueChange={field.onChange} value={field.value}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select a model">
                  {availableModels.find((m) => m.id === field.value)?.name ||
                    field.value}
                </SelectValue>
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {availableModels.map((model) => (
                <SelectItem key={model.id} value={model.id}>
                  {model.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormDescription>{description}</FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {topSaveButtonPortal}
        <div className="space-y-6">
          {/* Basic Settings */}
          <div>
            <h3 className="text-lg font-medium">Basic Settings</h3>
            <FormField
              control={form.control}
              name="guyName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Guy Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormDescription>
                    The name of your Codebase Guy instance.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Embedding Service */}
          <div>
            <h3 className="text-lg font-medium">Embedding Service</h3>
            <FormField
              control={form.control}
              name="embeddingServiceUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Embedding Service URL</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormDescription>
                    The URL of your embedding service.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Model Settings */}
          <div>
            <h3 className="text-lg font-medium">Model Settings</h3>
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="modelProvider"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Model Provider</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a provider" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.values(ModelProvider).map((provider) => (
                          <SelectItem key={provider} value={provider}>
                            {provider}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {modelProvider === "OLLAMA" && (
                <FormField
                  control={form.control}
                  name="ollamaUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ollama URL</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {modelProvider === "OPENAI" && (
                <>
                  <FormField
                    control={form.control}
                    name="openApiCompatibleApiUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>OpenAI Compatible API URL</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="modelApiKey"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>API Key</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}

              {modelField(
                "weakModel",
                "Weak Model",
                "The model used for simple tasks."
              )}
              {modelField(
                "strongModel",
                "Strong Model",
                "The model used for complex tasks."
              )}
              {modelField(
                "reasoningModel",
                "Reasoning Model",
                "The model used for reasoning tasks."
              )}
            </div>
          </div>

          {/* Cache Settings */}
          <div>
            <h3 className="text-lg font-medium">Cache Settings</h3>
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="cacheEnabled"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Enable Cache</FormLabel>
                      <FormDescription>
                        Enable caching to improve performance.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {cacheEnabled && (
                <>
                  <FormField
                    control={form.control}
                    name="cacheProvider"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cache Provider</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a provider" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.values(CacheProvider).map((provider) => (
                              <SelectItem key={provider} value={provider}>
                                {provider}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {cacheProvider === "REDIS" && (
                    <>
                      <FormField
                        control={form.control}
                        name="redisHost"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Redis Host</FormLabel>
                            <FormControl>
                              <Input {...field} value={field.value || ""} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="redisPort"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Redis Port</FormLabel>
                            <FormControl>
                              <Input {...field} value={field.value || ""} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Web Search Settings */}
          <div>
            <h3 className="text-lg font-medium">Web Search Settings</h3>
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="webSearchEnabled"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Enable Web Search
                      </FormLabel>
                      <FormDescription>
                        Enable web search capabilities.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {webSearchEnabled && (
                <>
                  <FormField
                    control={form.control}
                    name="webSearchProvider"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Web Search Provider</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a provider" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.values(WebSearchProvider).map(
                              (provider) => (
                                <SelectItem key={provider} value={provider}>
                                  {provider}
                                </SelectItem>
                              )
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {webSearchProvider === "SERPER" && (
                    <>
                      <FormField
                        control={form.control}
                        name="serperUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Serper URL</FormLabel>
                            <FormControl>
                              <Input {...field} value={field.value || ""} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="serperApiKey"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Serper API Key</FormLabel>
                            <FormControl>
                              <Input
                                type="password"
                                {...field}
                                value={field.value || ""}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
        {saveButton}
      </form>
    </Form>
  );
}
