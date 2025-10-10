export default {
    preset: "ts-jest",
    testEnvironment: "node",
    roots: ["<rootDir>/src"],
    moduleFileExtensions: ["ts", "js"],
    testMatch: ["**/*.(spec|test).ts"],
    transform: { "^.+\\.ts$": ["ts-jest", {}] },
};
//# sourceMappingURL=jest.config.js.map