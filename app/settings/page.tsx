import { SettingsConfiguration } from "@/components/settings-configuration";

export default function Settings() {
  return (
    <div className="h-full flex flex-col bg-gray-50">
      <div className="flex-none border-b bg-white px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
            <p className="mt-1 text-sm text-gray-500">
              Configure your Codebase Guy instance settings.
            </p>
          </div>
          <div id="top-save-button" />
        </div>
      </div>
      <div className="flex-1 overflow-auto p-6">
        <div className="mx-auto max-w-7xl">
          <div className="bg-white shadow-sm rounded-lg p-6">
            <SettingsConfiguration topSaveButtonId="top-save-button" />
          </div>
        </div>
      </div>
    </div>
  );
}
