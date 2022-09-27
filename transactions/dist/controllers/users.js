"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const users_1 = __importDefault(require("../database/models/users"));
exports.default = {
    userCreate(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const userParams = {
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                email: req.body.email
            };
            let verify = (userParams.firstName && userParams.lastName && userParams.email);
            if (verify) {
                const responseQuery = yield users_1.default.userCreate(userParams);
                console.log(responseQuery);
                return res.sendStatus(200).json(responseQuery);
            }
            return res.send(400).json('bad request');
        });
    }
};
