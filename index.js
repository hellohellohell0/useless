// Frontend code (your main script)
import { setDebugText, commaSeparate, range, range2, randInt, chunkArray } from "./utility.js"
import { divideIntoRectangles, reassembleImage } from "./rect.js"
import { generateFrame, header, footer } from "./export.js"

// define our variables
const original_canvas = document.querySelector("#original")
const original_ctx = original_canvas.getContext("2d")
const blocks_canvas = document.querySelector("#blocks")
const blocks_ctx = blocks_canvas.getContext("2d")
const final_canvas = document.querySelector("#final")
const final_ctx = final_canvas.getContext("2d")

const threshold = document.querySelector("#threshold")
const fileupload = document.querySelector(`input[type="file"]`)
const extreme = document.querySelector("#extreme")
const enabletransparency = document.querySelector("#transparency")
const error = document.querySelector("#error")

// Add new elements for Roblox upload
const robloxCookie = document.querySelector("#robloxCookie")
const modelName = document.querySelector("#modelName")
const modelDescription = document.querySelector("#modelDescription")
const groupId = document.querySelector("#groupId")
const autoUpload = document.querySelector("#autoUpload")
const uploadStatus = document.querySelector("#uploadStatus")

// the init function is called when an image is uploaded
async function init() {
	original_canvas.width = image.width
	original_canvas.height = image.height
	blocks_canvas.width = image.width
	blocks_canvas.height = image.height
	final_canvas.width = image.width
	final_canvas.height = image.height

	setDebugText("size", `${image.width}x${image.height}`)
	setDebugText("pixels", commaSeparate(image.width * image.height))

	for (const x of range(image.width)) {
		for (const y of range(image.height)) {
			var pixel = image.getPixelXY(x, y)
			original_ctx.fillStyle = `rgba(${pixel[0]}, ${pixel[1]}, ${pixel[2]}, ${pixel[3] ?? 255})`
			original_ctx.fillRect(x, y, 1, 1)
		}	
	}

	document.querySelector("#linewarning").innerHTML = "note: the squares/lines that may show up here will not <br> show up in-game."
}

// this function isn't used anymore but i didnt wanna get rid of it
function splitImage() {
	var colors = {}

	for (const x of range(image.width)) {
		for (const y of range(image.height)) {
			var pixel = image.getPixelXY(x, y)
			var color = `${pixel[0]}, ${pixel[1]}, ${pixel[2]}, ${pixel[3] ?? 255}`

			if (colors[color] == undefined) {
				colors[color] = []
			}

			colors[color].push([x, y])
		}	
	}

	return colors
}

// get a 2d array of pixels from a rectangular area
function getPixels(x1, y1, x2, y2) {
	var pixels = []

	for (const x of range2(x1, x2)) {
		var row = []
		for (const y of range2(y1, y2)) {
			row.push(image.getPixelXY(x, y))
		}
		pixels.push(row)
	}

	return pixels
}

// the main script, runs every time the threshold is changed
function run() {
	var startTime = Date.now()

	var pixels = getPixels(0, 0, image.width, image.height)
	var rect = divideIntoRectangles(pixels, threshold.value)
	var reassembled = reassembleImage(rect, image.width, image.height)

	for (const x of range(image.width)) {
		for (const y of range(image.height)) {
			var pixel = reassembled[x][y]

			blocks_ctx.fillStyle = `hsl(${pixel[0]}, 100%, 50%)`
			blocks_ctx.fillRect(x, y, 1, 1)

			final_ctx.fillStyle = `rgba(${pixel[0]}, ${pixel[1]}, ${pixel[2]}, ${pixel[3] ?? 255})`
			final_ctx.fillRect(x, y, 1, 1)
		}
	}

	setDebugText("blocks", commaSeparate(rect.length))
	setDebugText("time", `${Date.now() - startTime}ms`)
	setDebugText("improvement", `${Math.round((1 - (rect.length / (image.width * image.height))) * 100)}%`)

	return rect
}

function exportToROBLOX(rect) {
	var output = header

	for (const block of rect) {
		output += generateFrame(
			block.rect.x,
			block.rect.y,
			block.rect.width,
			block.rect.height,
			image.width,
			image.height,
			0.05,
			block.color[0],
			block.color[1],
			block.color[2],
			enabletransparency.checked ? block.color[3] ?? 255 : 255
		)
	}

	output += footer
	return output
}

// Replace the uploadToRoblox function with direct client-side upload
async function uploadToRoblox(modelData, uploadConfig) {
	try {
		uploadStatus.innerHTML = "Uploading directly to Roblox..."
		uploadStatus.style.color = "orange"

		
const modelBlob = new Blob([modelData], { type: 'application/xml' })

		// Prepare the form data for Open Cloud API
		const formData = new FormData()
		
		formData.append('request', JSON.stringify({
			assetType: 'Model',
			displayName: uploadConfig.name || "Generated Model",
			description: uploadConfig.description || "Generated using image-to-blocks converter",
			creationContext: {
				creator: {
					userId: uploadConfig.creatorType === 'group' ? undefined : uploadConfig.creatorId,
					groupId: uploadConfig.creatorType === 'group' ? uploadConfig.creatorId : undefined
				}
			}
		}))
		formData.append('fileContent', modelBlob, 'model.rbxm')

		// Upload directly to Roblox Open Cloud API
		const response = await fetch('https://apis.roblox.com/assets/v1/assets', {
			method: 'POST',
			headers: {
				'x-api-key': uploadConfig.apiKey
			},
			body: formData
		})

		const result = await response.json()

		if (response.ok) {
			uploadStatus.innerHTML = `✅ Upload successful! Asset ID: ${result.assetId}`
			uploadStatus.style.color = "green"
			return result
		} else {
			throw new Error(result.message || result.error || 'Upload failed')
		}
	} catch (err) {
		uploadStatus.innerHTML = `❌ Upload failed: ${err.message}`
		uploadStatus.style.color = "red"
		throw err
	}
}

// begin the actual script
var lastURL
fileupload.addEventListener("change", async (event) => {
	const file = event.target.files[0]

	if (lastURL) URL.revokeObjectURL(lastURL)
	lastURL = URL.createObjectURL(file)

	error.innerHTML = ""

	window.image = await IJS.Image.load(lastURL)
		.catch(err => {
			error.innerHTML = `catastrophic error: "${err}"<br> please try another image!`
			throw err
		})

	init()
	var rect = run()

	threshold.addEventListener("input", () => {
		setDebugText("threshold", threshold.value)

		if (threshold.value < 1) {
			document.querySelector("#thresholdwarning").innerHTML = "note: a threshold of zero removes the block <br> compression entirely, instead directly <br> copying the pixels. use with caution! <br>"
		} else {
			document.querySelector("#thresholdwarning").innerHTML = ""
		}

		run()
	})
})

// Modified export button with upload functionality
document.querySelector("#export").addEventListener("click", async () => {
	var output = exportToROBLOX(run())
	
	// Always download the file locally
	var file = new Blob([output], { type: "text/plain" })
	var a = document.createElement("a")
	a.download = `${fileupload.files[0].name}.rbxmx`
	a.href = window.URL.createObjectURL(file)
	a.click()
	a.remove()

	// Get the new elements
	const robloxApiKey = document.querySelector("#robloxApiKey")
	const creatorId = document.querySelector("#creatorId")
	const creatorType = document.querySelector("#creatorType")
	const autoUpload = document.querySelector("#autoUpload")

	// If auto-upload is enabled and API key is provided, also upload to Roblox
	if (autoUpload && autoUpload.checked && robloxApiKey && robloxApiKey.value.trim()) {
		try {
			const uploadConfig = {
				apiKey: robloxApiKey.value.trim(),
				creatorId: parseInt(creatorId.value),
				creatorType: creatorType.value,
				name: modelName.value || `${fileupload.files[0].name} - Generated Model`,
				description: modelDescription.value || "Generated using image-to-blocks converter"
			}

			await uploadToRoblox(output, uploadConfig)
		} catch (err) {
			console.error("Upload error:", err)
		}
	}
})

// allows you to use crazy thresholds like 100000
extreme.addEventListener("click", () => {
	if (extreme.checked == true) {
		threshold.max = 100000
	} else {
		threshold.max = 1000
	}
})

// reset all inputs on page load
window.onload = () => {
	threshold.value = 100
	extreme.checked = false
	enabletransparency.checked = false

	setDebugText("threshold", threshold.value)
}
