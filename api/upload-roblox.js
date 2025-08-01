// /api/upload-roblox.js - Vercel serverless function using Open Cloud API
export default async function handler(req, res) {
	// Set CORS headers first
	res.setHeader('Access-Control-Allow-Origin', '*')
	res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
	res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
	res.setHeader('Content-Type', 'application/json')

	// Handle preflight request
	if (req.method === 'OPTIONS') {
		return res.status(200).end()
	}

	// Only allow POST requests
	if (req.method !== 'POST') {
		return res.status(405).json({ error: 'Method not allowed' })
	}

	try {
		const { modelData, config } = req.body

		if (!modelData || !config || !config.apiKey) {
			return res.status(400).json({ error: 'Missing required data (modelData, config.apiKey)' })
		}

		if (!config.creatorId) {
			return res.status(400).json({ error: 'creatorId is required' })
		}

		// Convert string data to buffer
		const modelBuffer = Buffer.from(modelData, 'utf8')

		// Prepare the form data for Open Cloud API
		const formData = new FormData()
		
		// Create a blob from the buffer
		const blob = new Blob([modelBuffer], { type: 'application/octet-stream' })
		formData.append('request', JSON.stringify({
			assetType: 'Model',
			displayName: config.name || "Generated Model",
			description: config.description || "Generated using image-to-blocks converter",
			creationContext: {
				creator: {
					userId: config.creatorType === 'group' ? undefined : config.creatorId,
					groupId: config.creatorType === 'group' ? config.creatorId : undefined
				}
			}
		}))
		formData.append('fileContent', blob, 'model.rbxm')

		// Make request to Roblox Open Cloud API
		const response = await fetch('https://apis.roblox.com/assets/v1/assets', {
			method: 'POST',
			headers: {
				'x-api-key': config.apiKey
			},
			body: formData
		})

		const result = await response.json()

		if (response.ok) {
			return res.status(200).json({
				success: true,
				assetId: result.assetId,
				operationId: result.operationId,
				message: 'Model upload initiated successfully',
				result: result
			})
		} else {
			console.error('Roblox API error:', result)
			
			// Handle specific Open Cloud errors
			if (response.status === 401) {
				return res.status(401).json({ error: 'Invalid API key' })
			} else if (response.status === 403) {
				return res.status(403).json({ error: 'API key lacks required permissions' })
			} else if (response.status === 429) {
				return res.status(429).json({ error: 'Rate limit exceeded' })
			}
			
			return res.status(response.status).json({ 
				error: 'Upload failed', 
				details: result.message || result.error || 'Unknown error'
			})
		}

	} catch (error) {
		console.error('Upload error:', error)
		
		return res.status(500).json({ 
			error: 'Upload failed', 
			details: error.message 
		})
	}
}
