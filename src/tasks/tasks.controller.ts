import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  Query,
  UseGuards,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Task } from './entities/task.entity';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller()
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post('projects/:projectId/tasks')
  create(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Body() createTaskDto: CreateTaskDto,
  ): Promise<Task> {
    return this.tasksService.create(projectId, createTaskDto);
  }

  @Patch('tasks/:id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTaskDto: UpdateTaskDto,
  ): Promise<Task> {
    return this.tasksService.update(id, updateTaskDto);
  }

  @Delete('tasks/:id')
  @HttpCode(HttpStatus.OK)
  remove(@Param('id', ParseIntPipe) id: number): Promise<{ message: string }> {
    return this.tasksService.remove(id);
  }

  @Get('projects/:projectId/tasks')
  findAll(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Query('is_completed') isCompleted?: string,
    @Query('search') search?: string,
    @Query('limit', ParseIntPipe) limit: number = 10,
    @Query('offset', ParseIntPipe) offset: number = 0,
  ): Promise<{ tasks: Task[]; total: number }> {
    const isCompletedBool =
      isCompleted !== undefined
        ? isCompleted.toLowerCase() === 'true'
        : undefined;

    return this.tasksService.findAllByProject(
      projectId,
      isCompletedBool,
      search,
      limit,
      offset,
    );
  }
}
