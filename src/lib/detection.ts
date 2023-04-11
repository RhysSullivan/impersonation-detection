import { compareTwoStrings } from 'string-similarity';
import anyAscii from 'any-ascii';
import { ssim } from 'ssim.js';
export declare type ServerSideImageData = {
	readonly data: Uint8ClampedArray;
	readonly height: number;
	readonly width: number;
};

export function namesSimilarScore(official: string, suspect: string) {
	const cleanofficial = anyAscii(official).toLowerCase();
	const cleansuspect = anyAscii(suspect).toLowerCase();
	const similarity = compareTwoStrings(cleanofficial, cleansuspect);
	return similarity;
}

// TODO: Improve this
export function imagesSimilarScore(official: ServerSideImageData, suspect: ServerSideImageData) {
	const { mssim } = ssim(official, suspect, {});
	return mssim;
}

export type UserImposter = {
	name: string;
	nickname: string | null;
	avatar: ServerSideImageData;
};

export function isUserImposter(input: { official: UserImposter; suspect: UserImposter }) {
	const { official, suspect } = input;
	let similarity = 0;
	similarity += namesSimilarScore(official.name, suspect.name);
	similarity += official.nickname ? namesSimilarScore(official.nickname, suspect.name) : 0;
	similarity += suspect.nickname ? namesSimilarScore(official.name, suspect.nickname) : 0;
	similarity += suspect.nickname && official.nickname ? namesSimilarScore(official.nickname, suspect.nickname) : 0;
	similarity += imagesSimilarScore(official.avatar, suspect.avatar);
	return similarity > 1;
}
