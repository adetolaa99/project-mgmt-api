import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from './entities/task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { ProjectsService } from '../projects/projects.service';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private tasksRepository: Repository<Task>,
    private projectsService: ProjectsService,
  ) {}

  async create(projectId: number, createTaskDto: CreateTaskDto): Promise<Task> {
    const project = await this.projectsService.findOne(projectId);

    const task = this.tasksRepository.create({
      ...createTaskDto,
      project,
    });

    return this.tasksRepository.save(task);
  }

  async findOne(id: number): Promise<Task> {
    const task = await this.tasksRepository.findOne({
      where: { id },
      relations: ['project'],
    });

    if (!task) {
      throw new NotFoundException(`Task ${id} not found!`);
    }

    return task;
  }

  async update(id: number, updateTaskDto: UpdateTaskDto): Promise<Task> {
    const task = await this.findOne(id);
    this.tasksRepository.merge(task, updateTaskDto);
    return this.tasksRepository.save(task);
  }

  async remove(id: number): Promise<{ message: string }> {
    const task = await this.findOne(id);
    await this.tasksRepository.remove(task);
    return { message: `Task ${id} was successfully deleted` };
  }

  async findAllByProject(
    projectId: number,
    isCompleted?: boolean,
    search?: string,
    limit: number = 10,
    offset: number = 0,
  ): Promise<{ tasks: Task[]; total: number }> {
    await this.projectsService.findOne(projectId);

    const queryBuilder = this.tasksRepository
      .createQueryBuilder('task')
      .leftJoinAndSelect('task.project', 'project')
      .where('project.id = :projectId', { projectId });

    if (isCompleted !== undefined) {
      queryBuilder.andWhere('task.is_completed = :isCompleted', {
        isCompleted,
      });
    }

    if (search) {
      queryBuilder.andWhere('task.title LIKE :search', {
        search: `%${search}%`,
      });
    }

    const [tasks, total] = await queryBuilder
      .skip(offset)
      .take(limit)
      .getManyAndCount();

    return { tasks, total };
  }
}
