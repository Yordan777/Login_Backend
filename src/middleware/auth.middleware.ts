import { Request, Response, NextFunction } from 'express';
import { validationResult } from "express-validator"

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    res.status(400).json({ error: errors.array() })
  }
  next()
};