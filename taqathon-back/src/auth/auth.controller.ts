import {
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from './decorators/public.decorator';
import { LocalAuthGuard } from './guards/local.guard';
import { PassPortJwtGuard } from './guards/jwt.guard';
import { Response } from 'express';
import { ApiBody, ApiResponse } from '@nestjs/swagger';
import { CanAccess, Login } from './auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(200)
  @Post('/login')
  @Public()
  @UseGuards(LocalAuthGuard)
  @ApiResponse({ type: Login })
  @ApiBody({ type: Login })
  async login(@Req() req, @Res() res: Response) {
    const response = req.user;
    try {
      res.cookie('data', JSON.stringify(response));
      return res.json({
        success: true,
        accessToken: response.accessToken,
        id: response.id,
        userName: response.userName,
        redirectUrl: `${process.env.FRONT_URL}/auth/verify?accessToken=${response.accessToken}&uid=${response.id}&uname=${response.userName}`,
      });
    } catch (e) {
      console.error('Login error:', e);
    }
  }

  @HttpCode(200)
  @UseGuards(PassPortJwtGuard)
  @Get('/canAccess')
  @ApiResponse({ type: CanAccess })
  canAccess() {
    return { status: 'success' };
  }
}
