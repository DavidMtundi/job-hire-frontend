"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "~/components/ui/input";
import { useCreateJobMutation } from "~/apis/jobs/queries";
import { TCreateJobPayload, TCustomFieldInput } from "~/apis/jobs/schemas";

type CustomRequirementRow = {
  id: string;
  label: string;
  value: string;
  required: boolean;
};

const DEFAULT_CUSTOM_ROW: CustomRequirementRow = {
  id: crypto.randomUUID(),
  label: "",
  value: "",
  required: false,
};

const toList = (value: string): string[] =>
  value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);

const slugifyKey = (value: string): string =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

export default function CreateJobForm() {
  const router = useRouter();
  const createJobMutation = useCreateJobMutation();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [educationRequirements, setEducationRequirements] = useState("");
  const [requiredSkillsText, setRequiredSkillsText] = useState("");
  const [responsibilitiesText, setResponsibilitiesText] = useState("");
  const [benefitsText, setBenefitsText] = useState("");
  const [jobType, setJobType] =
    useState<TCreateJobPayload["job_type"]>("full_time");
  const [experienceLevel, setExperienceLevel] =
    useState<TCreateJobPayload["experience_level"]>("entry");
  const [salaryMin, setSalaryMin] = useState("");
  const [salaryMax, setSalaryMax] = useState("");
  const [salaryCurrency, setSalaryCurrency] = useState("USD");
  const [isRemote, setIsRemote] = useState(false);
  const [customRequirements, setCustomRequirements] = useState<
    CustomRequirementRow[]
  >([{ ...DEFAULT_CUSTOM_ROW }]);
  const [formError, setFormError] = useState("");

  const customFieldValidation = useMemo(() => {
    const normalized = customRequirements
      .map((item) => ({
        ...item,
        label: item.label.trim(),
        value: item.value.trim(),
      }))
      .filter((item) => item.label || item.value);

    const errors: string[] = [];
    const seenKeys = new Set<string>();

    for (const item of normalized) {
      if (!item.label || !item.value) {
        errors.push("Each custom requirement must include both label and value.");
        break;
      }
      const key = slugifyKey(item.label);
      if (!key) {
        errors.push("Custom requirement labels must include at least one letter or number.");
        break;
      }
      if (seenKeys.has(key)) {
        errors.push(`Duplicate custom requirement label: "${item.label}".`);
        break;
      }
      seenKeys.add(key);
    }

    return { normalized, errors };
  }, [customRequirements]);

  const addCustomRequirement = () => {
    setCustomRequirements((prev) => [
      ...prev,
      { id: crypto.randomUUID(), label: "", value: "", required: false },
    ]);
  };

  const updateCustomRequirement = (
    id: string,
    patch: Partial<CustomRequirementRow>
  ) => {
    setCustomRequirements((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...patch } : item))
    );
  };

  const removeCustomRequirement = (id: string) => {
    setCustomRequirements((prev) => {
      if (prev.length === 1) return [{ ...DEFAULT_CUSTOM_ROW }];
      return prev.filter((item) => item.id !== id);
    });
  };

  const buildCustomFields = (): TCustomFieldInput[] =>
    customFieldValidation.normalized.map((item) => ({
      field_name: item.label,
      field_key: slugifyKey(item.label),
      type: item.value.includes("\n") ? "multiline_text" : "text",
      value: item.value,
      required: item.required,
    }));

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError("");

    if (!title.trim() || !description.trim() || !location.trim()) {
      setFormError("Title, description, and location are required.");
      return;
    }

    if (customFieldValidation.errors.length > 0) {
      setFormError(customFieldValidation.errors[0]);
      return;
    }

    const payload: TCreateJobPayload = {
      title: title.trim(),
      description: description.trim(),
      responsibilities: toList(responsibilitiesText),
      benefits: toList(benefitsText),
      required_skills: toList(requiredSkillsText),
      education_requirements: educationRequirements.trim() || undefined,
      location: location.trim(),
      job_type: jobType,
      experience_level: experienceLevel,
      salary_min: salaryMin ? Number(salaryMin) : undefined,
      salary_max: salaryMax ? Number(salaryMax) : undefined,
      salary_currency: salaryCurrency.trim().toUpperCase() || "USD",
      is_remote: isRemote,
      custom_fields:
        customFieldValidation.normalized.length > 0 ? buildCustomFields() : undefined,
    };

    try {
      await createJobMutation.mutateAsync(payload);
      router.push("/jobs");
    } catch {
      // toast is handled in mutation error callback.
    }
  };

  return (
    <div className="mx-auto max-w-4xl p-6">
      <h1 className="mb-2 text-2xl font-semibold text-gray-900">Create Job</h1>
      <p className="mb-6 text-sm text-gray-600">
        Add the core job details plus any role-specific custom requirements.
      </p>

      <form className="space-y-6" onSubmit={handleSubmit}>
        <section className="space-y-4 rounded-md border bg-white p-4">
          <h2 className="text-lg font-medium">Core Details</h2>
          <Input
            placeholder="Job title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <textarea
            className="w-full rounded-md border p-2 text-sm"
            rows={5}
            placeholder="Job description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <Input
            placeholder="Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-sm">
              <span className="mb-1 block text-gray-700">Job Type</span>
              <select
                className="w-full rounded-md border p-2"
                value={jobType}
                onChange={(e) =>
                  setJobType(e.target.value as TCreateJobPayload["job_type"])
                }
              >
                <option value="full_time">Full time</option>
                <option value="part_time">Part time</option>
                <option value="contract">Contract</option>
                <option value="internship">Internship</option>
                <option value="temporary">Temporary</option>
              </select>
            </label>
            <label className="text-sm">
              <span className="mb-1 block text-gray-700">Experience Level</span>
              <select
                className="w-full rounded-md border p-2"
                value={experienceLevel}
                onChange={(e) =>
                  setExperienceLevel(
                    e.target.value as TCreateJobPayload["experience_level"]
                  )
                }
              >
                <option value="entry">Entry</option>
                <option value="mid">Mid</option>
                <option value="senior">Senior</option>
                <option value="lead">Lead</option>
                <option value="executive">Executive</option>
              </select>
            </label>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <Input
              placeholder="Salary min"
              type="number"
              value={salaryMin}
              onChange={(e) => setSalaryMin(e.target.value)}
            />
            <Input
              placeholder="Salary max"
              type="number"
              value={salaryMax}
              onChange={(e) => setSalaryMax(e.target.value)}
            />
            <Input
              placeholder="Currency (USD)"
              value={salaryCurrency}
              onChange={(e) => setSalaryCurrency(e.target.value)}
            />
          </div>
          <label className="inline-flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={isRemote}
              onChange={(e) => setIsRemote(e.target.checked)}
            />
            Remote role
          </label>
        </section>

        <section className="space-y-4 rounded-md border bg-white p-4">
          <h2 className="text-lg font-medium">Standard Requirements</h2>
          <textarea
            className="w-full rounded-md border p-2 text-sm"
            rows={3}
            placeholder="Required skills (one per line)"
            value={requiredSkillsText}
            onChange={(e) => setRequiredSkillsText(e.target.value)}
          />
          <textarea
            className="w-full rounded-md border p-2 text-sm"
            rows={3}
            placeholder="Education requirements"
            value={educationRequirements}
            onChange={(e) => setEducationRequirements(e.target.value)}
          />
          <textarea
            className="w-full rounded-md border p-2 text-sm"
            rows={3}
            placeholder="Responsibilities (one per line)"
            value={responsibilitiesText}
            onChange={(e) => setResponsibilitiesText(e.target.value)}
          />
          <textarea
            className="w-full rounded-md border p-2 text-sm"
            rows={3}
            placeholder="Benefits (one per line)"
            value={benefitsText}
            onChange={(e) => setBenefitsText(e.target.value)}
          />
        </section>

        <section className="space-y-4 rounded-md border bg-white p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium">Custom Requirements</h2>
            <button
              type="button"
              className="rounded-md border px-3 py-1 text-sm"
              onClick={addCustomRequirement}
            >
              Add Requirement
            </button>
          </div>
          {customRequirements.map((item, idx) => (
            <div key={item.id} className="space-y-2 rounded-md border p-3">
              <p className="text-sm font-medium text-gray-700">
                Requirement {idx + 1}
              </p>
              <Input
                placeholder="Label (e.g. Child safeguarding certification)"
                value={item.label}
                onChange={(e) =>
                  updateCustomRequirement(item.id, { label: e.target.value })
                }
              />
              <textarea
                className="w-full rounded-md border p-2 text-sm"
                rows={3}
                placeholder="Requirement details / custom message"
                value={item.value}
                onChange={(e) =>
                  updateCustomRequirement(item.id, { value: e.target.value })
                }
              />
              <div className="flex items-center justify-between">
                <label className="inline-flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={item.required}
                    onChange={(e) =>
                      updateCustomRequirement(item.id, {
                        required: e.target.checked,
                      })
                    }
                  />
                  Required
                </label>
                <button
                  type="button"
                  className="text-sm text-red-600"
                  onClick={() => removeCustomRequirement(item.id)}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </section>

        {formError ? (
          <p className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {formError}
          </p>
        ) : null}

        <div className="flex gap-3">
          <button
            type="button"
            className="rounded-md border px-4 py-2 text-sm"
            onClick={() => router.back()}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded-md bg-black px-4 py-2 text-sm text-white"
            disabled={createJobMutation.isPending}
          >
            {createJobMutation.isPending ? "Creating..." : "Create Job"}
          </button>
        </div>
      </form>
    </div>
  );
}
