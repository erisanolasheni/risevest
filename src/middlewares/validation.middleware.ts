import { body, validationResult, ValidationChain } from "express-validator";
import { Request, Response, NextFunction } from "express";

// Login validation
export const validateLogin: ValidationChain[] = [
  body("email").isEmail().withMessage("Please enter a valid email"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
];

// Register validation
export const validateRegister: ValidationChain[] = [
  body("name").notEmpty().withMessage("Name is required"),
  body("email").isEmail().withMessage("Please enter a valid email"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
];

export const validateUserUpdate: ValidationChain[] = [
  body("name").notEmpty().optional().withMessage("Name is required"),
  body("email").isEmail().optional().withMessage("Please enter a valid email"),
  body("password")
    .optional()
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
];

// Post validation
export const validatePost: ValidationChain[] = [
  body("title").notEmpty().withMessage("Title is required"),
  body("content").notEmpty().withMessage("Content is required"),
];

export const validatePostUpdate: ValidationChain[] = [
  body("title").optional().notEmpty().withMessage("Title is required"),
  body("content").optional().notEmpty().withMessage("Content is required"),
];

// Comment validation
export const validateComment: ValidationChain[] = [
  body("content").notEmpty().withMessage("Content is required"),
];

// General middleware for handling validation errors
export const validateMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};
