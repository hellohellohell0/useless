// /api/upload-roblox.js - Vercel Edge Function using Open Cloud API
export const config = {
	runtime: 'edge'
}

export default async function handler(req) {
	// Handle preflight request
	if (req.method === 'OPTIONS') {
		return new Response(null, {
			status: 200,
			headers: {
				'Access-Control-Allow-Origin': '*',
				'Access-Control-Allow-Methods': 'POST, OPTIONS',
				'Access-Control-Allow-Headers': 'Content-Type'
			}
		})
	}

	// Only allow POST requests
	if (req.method !== 'POST') {
		return new Response(JSON.stringify({ error: 'Method not allowed' }), {
			status: 405,
			headers: {
				'Access-Control-Allow-Origin': '*',
				'Content-Type': 'application/json'
			}
		})
	}

	try {
		const { modelData, config } = await req.json()

		if (!modelData || !config || !config.apiKey) {
			return new Response(JSON.stringify({ error: 'Missing required data (modelData, config.apiKey)' }), {
				status: 400,
				headers: {
					'Access-Control-Allow-Origin': '*',
					'Content-Type': 'application/json'
				}
			})
		}

		if (!config.creatorId) {
			return new Response(JSON.stringify({ error: 'creatorId is required' }), {
				status: 400,
				headers: {
					'Access-Control-Allow-Origin': '*',
					'Content-Type': 'application/json'
				}
			})
		}

		// Convert string data to buffer
		const modelBuffer = new TextEncoder().encode(modelData)

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
			return new Response(JSON.stringify({
				success: true,
				assetId: result.assetId,
				operationId: result.operationId,
				message: 'Model upload initiated successfully',
				result: result
			}), {
				status: 200,
				headers: {
					'Access-Control-Allow-Origin': '*',
					'Content-Type': 'application/json'
				}
			})
		} else {
			console.error('Roblox API error:', result)
			
			// Handle specific Open Cloud errors
			if (response.status === 401) {
				return new Response(JSON.stringify({ error: 'Invalid API key' }), {
					status: 401,
					headers: {
						'Access-Control-Allow-Origin': '*',
						'Content-Type': 'application/json'
					}
				})
			} else if (response.status === 403) {
				return new Response(JSON.stringify({ error: 'API key lacks required permissions' }), {
					status: 403,
					headers: {
						'Access-Control-Allow-Origin': '*',
						'Content-Type': 'application/json'
					}
				})
			} else if (response.status === 429) {
				return new Response(JSON.stringify({ error: 'Rate limit exceeded' }), {
					status: 429,
					headers: {
						'Access-Control-Allow-Origin': '*',
						'Content-Type': 'application/json'
					}
				})
			}
			
			return new Response(JSON.stringify({ 
				error: 'Upload failed', 
				details: result.message || result.error || 'Unknown error'
			}), {
				status: response.status,
				headers: {
					'Access-Control-Allow-Origin': '*',
					'Content-Type': 'application/json'
				}
			})
		}

	} catch (error) {
		console.error('Upload error:', error)
		
		return new Response(JSON.stringify({ 
			error: 'Upload failed', 
			details: error.message 
		}), {
			status: 500,
			headers: {
				'Access-Control-Allow-Origin': '*',
				'Content-Type': 'application/json'
			}
		})
	}
}
