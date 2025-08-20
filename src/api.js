export async function createBrochure(company_name, url) {
const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/brochure`, {
method: 'POST',
headers: { 'Content-Type': 'application/json' },
body: JSON.stringify({ company_name, url }),
})


if (!res.ok) {
const text = await res.text()
throw new Error(`API ${res.status}: ${text}`)
}


return res.json()
}