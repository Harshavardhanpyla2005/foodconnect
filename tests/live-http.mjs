import http from "node:http"
import assert from "node:assert/strict"

// Helper function to send HTTP requests to localhost:3000
function makeRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = ""
      res.on("data", (chunk) => (body += chunk))
      res.on("end", () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body,
          json: () => {
            try {
              return JSON.parse(body)
            } catch {
              return null
            }
          },
        })
      })
    })
    req.on("error", reject)
    if (postData) {
      req.write(typeof postData === "string" ? postData : JSON.stringify(postData))
    }
    req.end()
  })
}

async function runLiveHttpVerification() {
  console.log("=== FOODCONNECT LIVE HTTP & WORKFLOW VERIFICATION ===\n")

  // 1. Verify Home & Public Endpoints
  console.log("1. Testing Public Endpoints...")
  const homeRes = await makeRequest({
    hostname: "localhost",
    port: 3000,
    path: "/",
    method: "GET",
  })
  assert.equal(homeRes.statusCode, 200, "Home page must respond with 200")
  console.log("   ✓ Home page renders (Status: 200)")

  const loginRes = await makeRequest({
    hostname: "localhost",
    port: 3000,
    path: "/login",
    method: "GET",
  })
  assert.equal(loginRes.statusCode, 200, "Login page must respond with 200")
  console.log("   ✓ Login page renders (Status: 200)")

  // 2. Test Volunteer Claim Endpoint Without Auth -> Must return 401
  console.log("\n2. Testing Volunteer Claim API Security (Unauthenticated)...")
  const unauthClaim = await makeRequest(
    {
      hostname: "localhost",
      port: 3000,
      path: "/api/collections/col-vizag-03/claim",
      method: "POST",
      headers: { "Content-Type": "application/json" },
    },
    {}
  )
  assert.equal(unauthClaim.statusCode, 401, "Unauthenticated claim must return 401")
  const unauthJson = unauthClaim.json()
  assert.equal(
    unauthJson?.error,
    "Please sign in as a volunteer to claim this pickup.",
    "Must return exact Section 10 unauthenticated error message"
  )
  console.log("   ✓ Unauthenticated claim blocked: HTTP 401, message matches Section 10")

  console.log("\n=== HTTP VERIFICATION SUCCESSFUL ===")
}

runLiveHttpVerification().catch((err) => {
  console.error("Verification failed:", err)
  process.exit(1)
})
