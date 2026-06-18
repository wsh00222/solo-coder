"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const routes_1 = __importDefault(require("./routes"));
const seed_1 = require("./seed");
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
(0, seed_1.seedData)();
app.use('/api', routes_1.default);
const frontendDist = path_1.default.join(__dirname, '..', '..', 'frontend', 'dist');
app.use(express_1.default.static(frontendDist));
app.get('*', (_req, res) => {
    res.sendFile(path_1.default.join(frontendDist, 'index.html'));
});
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
