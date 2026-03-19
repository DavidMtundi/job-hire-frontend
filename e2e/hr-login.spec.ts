import { test, expect } from "@playwright/test";

test("Login page renders and accepts input", async ({ page }) => {
  await page.goto("/login", { waitUntil: "domcontentloaded" });

  await expect(page.locator("input#email")).toBeVisible();
  await expect(page.locator("input#password")).toBeVisible();
  await expect(page.getByRole("button", { name: "Login" })).toBeVisible();

  await page.locator("input#email").fill("testhr@jobhire.com");
  await page.locator("input#password").fill("TestHR123!");
});

test("Backend docs are reachable from browser context", async ({ page }) => {
  const railwayBackendBaseUrl =
    process.env.NEXT_PUBLIC_BASE_API_URL ?? "https://job-hire-backend-production.up.railway.app";
  const backendDocs =
    process.env.E2E_BACKEND_DOCS_URL ?? `${railwayBackendBaseUrl.replace(/\/+$/, "")}/docs`;
  await page.goto(backendDocs, { waitUntil: "domcontentloaded" });
  await expect(page).toHaveURL(/\/docs/);
  await expect(page.getByText(/swagger ui|openapi/i)).toBeVisible();
});

