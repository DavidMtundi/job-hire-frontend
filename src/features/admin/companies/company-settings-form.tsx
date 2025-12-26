"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Settings, Mail, Save, Loader2 } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Switch } from "~/components/ui/switch";
import { toast } from "sonner";
import {
  useGetCompanySettingsQuery,
  useUpdateCompanySettingsMutation,
} from "~/apis/companies/queries";

const settingsSchema = z.object({
  auto_send_on_application_received: z.boolean(),
  auto_send_on_status_update: z.boolean(),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

interface CompanySettingsFormProps {
  companyId: string;
}

export function CompanySettingsForm({ companyId }: CompanySettingsFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: settingsData, isLoading } = useGetCompanySettingsQuery(companyId);
  const updateSettings = useUpdateCompanySettingsMutation();

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      auto_send_on_application_received: false,
      auto_send_on_status_update: false,
    },
    values: settingsData?.data
      ? {
          auto_send_on_application_received:
            settingsData.data.auto_send_on_application_received,
          auto_send_on_status_update: settingsData.data.auto_send_on_status_update,
        }
      : undefined,
  });

  const onSubmit = async (data: SettingsFormValues) => {
    setIsSubmitting(true);
    try {
      const result = await updateSettings.mutateAsync({
        companyId,
        data: {
          auto_send_on_application_received: data.auto_send_on_application_received,
          auto_send_on_status_update: data.auto_send_on_status_update,
        },
      });

      if (result.success) {
        toast.success("Settings updated successfully!");
      } else {
        toast.error(result.message || "Failed to update settings");
      }
    } catch (error: any) {
      toast.error(error?.message || "Failed to update settings");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Settings className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <CardTitle>Email Automation Settings</CardTitle>
            <CardDescription>
              Configure automatic email notifications for candidates
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="auto_send_on_application_received"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Auto-send on Application Received</FormLabel>
                      <FormDescription>
                        Automatically send an email to candidates when they submit an application
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

              <div className="border-t my-4" />

              <FormField
                control={form.control}
                name="auto_send_on_status_update"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Auto-send on Status Update</FormLabel>
                      <FormDescription>
                        Automatically send an email to candidates when their application status
                        changes (e.g., shortlisted, rejected)
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
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Settings
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

