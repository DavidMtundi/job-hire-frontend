const functions = require("firebase-functions");
const next = require("next");

// This function proxies all Hosting requests into the Next.js server.
// The Next app must already be built into `job-hire-frontend/.next` before deploy.
const dir = __dirname;
const dev = false;

let nextAppPromise = null;

async function getRequestHandler() {
  if (!nextAppPromise) {
    nextAppPromise = (async () => {
      const app = next({ dev, dir, hostname: "0.0.0.0" });
      await app.prepare();
      return app.getRequestHandler();
    })();
  }
  return nextAppPromise;
}

exports.nextApp = functions.https.onRequest(async (req, res) => {
  try {
    const handler = await getRequestHandler();
    return handler(req, res);
  } catch (err) {
    console.error("nextApp handler error:", err);
    const message = err && err.stack ? err.stack : String(err);
    res.status(500).type("text/plain").send(message);
  }
});

