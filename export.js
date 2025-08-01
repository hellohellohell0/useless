export const header = `<roblox xmlns:xmime="http://www.w3.org/2005/05/xmlmime" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="http://www.roblox.com/roblox.xsd" version="4">
<Meta name="ExplicitAutoJoints">true</Meta>
<External>null</External>
<External>nil</External>
<Item class="Model">
<Properties>
<string name="Name">PixelArtModel</string>
</Properties>
<Item class="Folder">
<Properties>
<string name="Name">PixelArt</string>
</Properties>
`

export const footer = `
</Item>
</Item>
</roblox>
`

export const generateFrame = (x, y, width, height, imagewidth, imageheight, imageoffset, r, g, b, a) => {
	const worldX = (x / imagewidth) * 16 - 8 + (width / imagewidth) * 8;
	const worldY = 8 - (y / imageheight) * 16 - (height / imageheight) * 8;
	const worldZ = 0;
	
	const partWidth = (width / imagewidth) * 16 + imageoffset + 0.01;
	const partHeight = (height / imageheight) * 16 + imageoffset + 0.01;
	const partDepth = 5;
	const color3uint8 = (Math.floor(r) << 16) | (Math.floor(g) << 8) | Math.floor(b) | 0xFF000000;
	
	return `<Item class="Part">
<Properties>
<bool name="Anchored">true</bool>
<CoordinateFrame name="CFrame">
<X>${worldX}</X>
<Y>${worldY}</Y>
<Z>${worldZ}</Z>
<R00>1</R00>
<R01>0</R01>
<R02>0</R02>
<R10>0</R10>
<R11>1</R11>
<R12>0</R12>
<R20>0</R20>
<R21>0</R21>
<R22>1</R22>
</CoordinateFrame>
<bool name="CanCollide">false</bool>
<Color3uint8 name="Color3uint8">${color3uint8}</Color3uint8>
<string name="Name">Pixel</string>
<float name="Transparency">${(255 - a) / 255}</float>
<Vector3 name="size">
<X>${partWidth}</X>
<Y>${partHeight}</Y>
<Z>${partDepth}</Z>
</Vector3>
</Properties>
</Item>
`
}
