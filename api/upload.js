// /api/upload-roblox.js - Vercel serverless function
const noblox = require("noblox.js")

export default async function handler(req, res) {
	// Only allow POST requests
	if (req.method !== 'POST') {
		return res.status(405).json({ error: 'Method not allowed' })
	}

	try {
		const { modelData, config } = req.body

		if (!modelData || !config || !config.cookie) {
			return res.status(400).json({ error: 'Missing required data' })
		}

		// Set CORS headers to allow frontend requests
		res.setHeader('Access-Control-Allow-Origin', '*')
		res.setHeader('Access-Control-Allow-Methods', 'POST')
		res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

		// Login to Roblox using the provided cookie
		await noblox.setCookie(config.cookie)

		// Get current user to verify login
		const currentUser = await noblox.getCurrentUser()
		console.log(`Logged in as: ${currentUser.UserName} (${currentUser.UserId})`)

		// Convert string data to buffer for upload
		const modelBuffer = Buffer.from(modelData, 'utf8')

		// Upload configuration
		const uploadOptions = {
			name: config.name || "Generated Model",
			description: config.description || "Generated using image-to-blocks converter",
			copyLocked: config.copyLocked || false,
			allowComments: config.allowComments || false
		}

		// Add groupId if provided
		if (config.groupId) {
			uploadOptions.groupId = config.groupId
		}

		// Upload the model to Roblox
		const result = await noblox.uploadModel(modelBuffer, uploadOptions)

		return res.status(200).json({
			success: true,
			assetId: result,
			user: currentUser.UserName,
			message: 'Model uploaded successfully'
		})

	} catch (error) {
		console.error('Upload error:', error)
		
		// Handle specific Roblox errors
		if (error.message.includes('Token Validation Failed')) {
			return res.status(401).json({ error: 'Invalid Roblox cookie' })
		}
		
		if (error.message.includes('insufficient funds')) {
			return res.status(402).json({ error: 'Insufficient Robux for upload' })
		}

		return res.status(500).json({ 
			error: 'Upload failed', 
			details: error.message 
		})
	}
}