import { namesSimilarScore, imagesSimilarScore, ServerSideImageData } from './detection';
import sharp from 'sharp';
const target = 'theo';

describe('name-detection', () => {
	test('Cases', () => {
		const caseVariants = ['theo', 'Theo', 'THEO', 'ThEo', 'tHeO', 'THEO', 'tHEo', 'thEO', 'tHeO', 'tHEO'];
		caseVariants.forEach((name) => {
			expect(namesSimilarScore(target, name), `${name} is not similar to ${target}`).toBeTruthy();
		});
	});
	test('Unicode', async () => {
		const unicodeVariants = [
			'theo',
			'𝚝𝚑𝚎𝚘',
			'𝚃𝙷𝙴𝙾',
			'𝚝𝙷𝙴𝙾',
			'𝚃𝚑𝚎𝚘',
			'𝚝𝚑𝚎𝙾',
			'𝚃𝙷𝙴𝙾',
			'𝚝𝚑𝚎𝚘',
			'𝚃𝙷𝙴𝙾',
			'𝚃𝚑𝚎𝚘',
			'𝓣𝓱𝓮𝓸',
			'𝕿𝖍𝖊𝖔',
			'𝖳𝗁𝖾𝗈',
			'𝙏𝙝𝙚𝙤',
			'𝑻𝒉𝒆𝒐',
			'𝗧𝗵𝗲𝗼',
			'𝘛𝘩𝘦𝘰',
			'𝒯𝒽𝑒𝑜',
			'𝕋𝕙𝕖𝕠',
			'𝓉𝒽ℯ𝑜',
			'𝕥𝕙𝕖o𝕠',
			'𝖙𝖍𝖊𝖔𝖔',
			'𝗍𝗁𝖾𝗈𝗈',
			'𝘁𝗁𝗲𝗼𝗼',
			'𝙩𝙝𝙚𝙤𝙤',
			'𝚝𝚑𝚎𝚘𝚘',
			'𝚃𝚑𝚎𝚘𝚘'
		];
		unicodeVariants.forEach((name) => {
			expect(namesSimilarScore(target, name), `${name} is not similar to ${target}`).toBeTruthy();
		});
	});
	test('not similar', () => {
		const notSimilar = ['the', 'theodore', 'theodora', 'theodorus', 'theodd'];
		notSimilar.forEach((name) => {
			expect(namesSimilarScore(target, name), `${name} should not be similar to ${target}`).toBeFalsy();
		});
	});
});

async function loadSharpAsImageData(path: string): Promise<ServerSideImageData> {
	const raw = await sharp(path).raw().toBuffer({
		resolveWithObject: true
	});
	return {
		data: new Uint8ClampedArray(raw.data),
		height: raw.info.height,
		width: raw.info.width
	};
}

describe('Image detection', () => {
	it('should detect identical images', async () => {
		const image = await loadSharpAsImageData('./test/theo.png');
		const image2 = await loadSharpAsImageData('./test/theo.png');
		expect(imagesSimilarScore(image, image2)).toBe(true);
	});
	it('should detect kind of similar images', async () => {
		const image = await loadSharpAsImageData('./test/theo.png');
		const image2 = await loadSharpAsImageData('./test/theo-v1.png');
		expect(imagesSimilarScore(image, image2)).toBe(true);
	});
	it('should not detect almost similar images', async () => {
		const image = await loadSharpAsImageData('./test/theo.png');
		const image2 = await loadSharpAsImageData('./test/theo-v2.png');
		expect(imagesSimilarScore(image, image2)).toBe(false);
	});
	it('should detect a blurry image', async () => {
		const image = await loadSharpAsImageData('./test/theo.png');
		const image2 = await loadSharpAsImageData('./test/theo-v3.png');
		expect(imagesSimilarScore(image, image2)).toBe(true);
	});
	it("should not detect images that aren't similar", async () => {
		const image = await loadSharpAsImageData('./test/theo.png');
		const image2 = await loadSharpAsImageData('./test/not-theo.png');
		await expect(imagesSimilarScore(image, image2)).toBe(false);
	});
});
