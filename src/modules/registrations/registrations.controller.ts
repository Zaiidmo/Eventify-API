import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Request,
} from '@nestjs/common';
import { RegistrationsService } from './registrations.service';
import { CreateRegistrationDto } from './dto/create-registration.dto';
import { UpdateRegistrationDto } from './dto/update-registration.dto';
import { Request as req } from 'express';

@Controller('registrations')
export class RegistrationsController {
  constructor(private readonly registrationsService: RegistrationsService) {}

  @Post()
  create(
    @Body() createRegistrationDto: CreateRegistrationDto,
    @Request() request: req,
  ): Promise<any> {
    const user = request.user._id.toString();
    try {
      return this.registrationsService.createRegistration(
        createRegistrationDto,
        user,
      );
    } catch (error) {
      throw new Error(error.message);
    }
  }

  // Delete a regestration
  @Delete(':id')
  remove(@Param('id') id: string, @Request() request: req) {
    const user = request.user._id.toString();
    try{
    return this .registrationsService.removeRegistration(user, id);
    } catch (error) {
      throw new Error(error.message);
    }
  }

  @Get()
  findAll() {
    return this.registrationsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.registrationsService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateRegistrationDto: UpdateRegistrationDto,
  ) {
    return this.registrationsService.update(+id, updateRegistrationDto);
  }

}
