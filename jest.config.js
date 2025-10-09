module.exports = {
	preset: 'ts-jest',
	testEnvironment: 'node',
	roots: ['<rootDir>/nodes'],
	testMatch: ['**/*.test.ts'],
	collectCoverageFrom: [
		'nodes/**/*.ts',
		'!nodes/**/*.test.ts',
		'!nodes/**/*.node.ts',
	],
	moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
	transform: {
		'^.+\\.ts$': 'ts-jest',
	},
};
