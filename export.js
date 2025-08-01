export const header = `<roblox xmlns:xmime="http://www.w3.org/2005/05/xmlmime" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="http://www.roblox.com/roblox.xsd" version="4">
	<Meta name="ExplicitAutoJoints">true</Meta>
	<External>null</External>
	<External>nil</External>
	<Item class="Model">
		<Properties>
			<BinaryString name="AttributesSerialize"></BinaryString>
			<string name="Name">PixelArtModel</string>
			<int64 name="SourceAssetId">-1</int64>
			<BinaryString name="Tags"></BinaryString>
		</Properties>
		<Item class="Folder">
			<Properties>
				<BinaryString name="AttributesSerialize"></BinaryString>
				<string name="Name">PixelArt</string>
				<int64 name="SourceAssetId">-1</int64>
				<BinaryString name="Tags"></BinaryString>
			</Properties>
`

export const footer = `
		</Item>
		<Item class="Camera">
			<Properties>
				<BinaryString name="AttributesSerialize"></BinaryString>
				<CoordinateFrame name="CFrame">
					<X>0</X>
					<Y>0</Y>
					<Z>15</Z>
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
				<float name="FieldOfView">70</float>
				<string name="Name">ThumbnailCamera</string>
				<int64 name="SourceAssetId">-1</int64>
				<BinaryString name="Tags"></BinaryString>
			</Properties>
		</Item>
	</Item>
</roblox>
`

export const generateFrame = (x, y, width, height, imagewidth, imageheight, imageoffset, r, g, b, a) => {
	const worldX = (x / imagewidth) * 16 - 8 + (width / imagewidth) * 8;
	const worldY = 8 - (y / imageheight) * 16 - (height / imageheight) * 8;
	const worldZ = 0;
	
	const partWidth = (width / imagewidth) * 16 + imageoffset + 0.01; // avoid z-fighting
	const partHeight = (height / imageheight) * 16 + imageoffset + 0.01; // avoid z-fighting
	const partDepth = 5; // thin
	const color3uint8 = (Math.floor(r) << 16) | (Math.floor(g) << 8) | Math.floor(b) | 0xFF000000;
	
	return `			<Item class="Part">
				<Properties>
					<bool name="Anchored">true</bool>
					<BinaryString name="AttributesSerialize"></BinaryString>
					<float name="BackParamA">-0.5</float>
					<float name="BackParamB">0.5</float>
					<token name="BackSurface">0</token>
					<token name="BackSurfaceInput">0</token>
					<float name="BottomParamA">-0.5</float>
					<float name="BottomParamB">0.5</float>
					<token name="BottomSurface">0</token>
					<token name="BottomSurfaceInput">0</token>
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
					<bool name="CanQuery">true</bool>
					<bool name="CanTouch">true</bool>
					<bool name="CastShadow">false</bool>
					<string name="CollisionGroup">Default</string>
					<int name="CollisionGroupId">0</int>
					<Color3uint8 name="Color3uint8">${color3uint8}</Color3uint8>
					<PhysicalProperties name="CustomPhysicalProperties">
						<CustomPhysics>false</CustomPhysics>
					</PhysicalProperties>
					<float name="FrontParamA">-0.5</float>
					<float name="FrontParamB">0.5</float>
					<token name="FrontSurface">0</token>
					<token name="FrontSurfaceInput">0</token>
					<float name="LeftParamA">-0.5</float>
					<float name="LeftParamB">0.5</float>
					<token name="LeftSurface">0</token>
					<token name="LeftSurfaceInput">0</token>
					<bool name="Locked">false</bool>
					<bool name="Massless">true</bool>
					<token name="Material">256</token>
					<string name="MaterialVariantSerialized"></string>
					<string name="Name">Pixel</string>
					<CoordinateFrame name="PivotOffset">
						<X>0</X>
						<Y>0</Y>
						<Z>0</Z>
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
					<float name="Reflectance">0</float>
					<float name="RightParamA">-0.5</float>
					<float name="RightParamB">0.5</float>
					<token name="RightSurface">0</token>
					<token name="RightSurfaceInput">0</token>
					<int name="RootPriority">0</int>
					<Vector3 name="RotVelocity">
						<X>0</X>
						<Y>0</Y>
						<Z>0</Z>
					</Vector3>
					<int64 name="SourceAssetId">-1</int64>
					<BinaryString name="Tags"></BinaryString>
					<float name="TopParamA">-0.5</float>
					<float name="TopParamB">0.5</float>
					<token name="TopSurface">0</token>
					<token name="TopSurfaceInput">0</token>
					<float name="Transparency">${(255 - a) / 255}</float>
					<Vector3 name="Velocity">
						<X>0</X>
						<Y>0</Y>
						<Z>0</Z>
					</Vector3>
					<token name="formFactorRaw">1</token>
					<token name="shape">1</token>
					<Vector3 name="size">
						<X>${partWidth}</X>
						<Y>${partHeight}</Y>
						<Z>${partDepth}</Z>
					</Vector3>
				</Properties>
			</Item>
`
}