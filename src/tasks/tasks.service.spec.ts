import { Test, TestingModule } from '@nestjs/testing';
import { TasksService } from './tasks.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Task } from './entities/task.entity';
import { NotFoundException } from '@nestjs/common';
import { ProjectsService } from '../projects/projects.service';
import { Project } from '../projects/entities/project.entity';

describe('TasksService', () => {
  let tasksService: TasksService;
  let tasksRepository: Repository<Task>;
  let projectsService: ProjectsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        {
          provide: getRepositoryToken(Task),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            remove: jest.fn(),
            merge: jest.fn(),
            createQueryBuilder: jest.fn().mockReturnValue({
              leftJoinAndSelect: jest.fn().mockReturnThis(),
              where: jest.fn().mockReturnThis(),
              andWhere: jest.fn().mockReturnThis(),
              skip: jest.fn().mockReturnThis(),
              take: jest.fn().mockReturnThis(),
              getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
            }),
          },
        },
        {
          provide: ProjectsService,
          useValue: {
            findOne: jest
              .fn()
              .mockResolvedValue({ id: 1, name: 'Test Project' } as Project),
          },
        },
      ],
    }).compile();

    tasksService = module.get<TasksService>(TasksService);
    tasksRepository = module.get<Repository<Task>>(getRepositoryToken(Task));
    projectsService = module.get<ProjectsService>(ProjectsService);
  });

  it('should create a task', async () => {
    const createTaskDto = {
      title: 'New Task',
      due_date: new Date().toISOString(),
    };

    const task = {
      title: 'New Task',
      due_date: new Date(),
      is_completed: false,
      created_at: new Date(),
      project: { id: 1 } as Project,
    } as Task;

    const savedTask: Task = {
      id: 1,
      title: 'New Task',
      is_completed: false,
      due_date: new Date(),
      created_at: new Date(),
      project: { id: 1 } as Project,
    };

    jest.spyOn(tasksRepository, 'create').mockReturnValue(task);
    jest.spyOn(tasksRepository, 'save').mockResolvedValue(savedTask);

    const result = await tasksService.create(1, createTaskDto);
    expect(result).toEqual(savedTask);

    expect(tasksRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        ...createTaskDto,
        project: expect.any(Object),
      }),
    );
    expect(tasksRepository.save).toHaveBeenCalledWith(
      expect.objectContaining(task),
    );
  });

  it('should return a task by ID', async () => {
    const project = {
      id: 1,
      name: 'Test Project',
      description: 'Sample description',
      created_at: new Date(),
      tasks: [],
    };
    const task = {
      id: 1,
      title: 'Task 1',
      is_completed: false,
      due_date: new Date(),
      created_at: new Date(),
      project,
    };

    jest.spyOn(tasksRepository, 'findOne').mockResolvedValue(task);

    const result = await tasksService.findOne(1);
    expect(result).toEqual(task);
    expect(tasksRepository.findOne).toHaveBeenCalledWith({
      where: { id: 1 },
      relations: ['project'],
    });
  });

  it('should throw NotFoundException if task is not found', async () => {
    jest.spyOn(tasksRepository, 'findOne').mockResolvedValue(null);

    await expect(tasksService.findOne(999)).rejects.toThrow(NotFoundException);
  });

  it('should update a task', async () => {
    const existingTask = {
      id: 1,
      title: 'Old Task',
      is_completed: false,
      due_date: new Date(),
      created_at: new Date(),
      project: { id: 1 } as Project,
    };
    const updateDto = { title: 'Updated Task', is_completed: true };

    jest.spyOn(tasksRepository, 'findOne').mockResolvedValue(existingTask);
    jest
      .spyOn(tasksRepository, 'save')
      .mockResolvedValue({ ...existingTask, ...updateDto });

    const result = await tasksService.update(1, updateDto);
    expect(result).toEqual({ ...existingTask, ...updateDto });
    expect(tasksRepository.save).toHaveBeenCalled();
  });

  it('should delete a task', async () => {
    const existingTask = {
      id: 1,
      title: 'Task to Delete',
      is_completed: true,
      due_date: new Date(),
      created_at: new Date(),
      project: { id: 1 } as Project,
    };

    jest.spyOn(tasksRepository, 'findOne').mockResolvedValue(existingTask);
    jest.spyOn(tasksRepository, 'remove').mockResolvedValue(existingTask);

    const result = await tasksService.remove(1);
    expect(result).toEqual({ message: `Task 1 was successfully deleted` });
    expect(tasksRepository.remove).toHaveBeenCalledWith(existingTask);
  });

  it('should fetch tasks for a project', async () => {
    const result = await tasksService.findAllByProject(1, true, '', 10, 0);
    expect(result).toEqual({ tasks: [], total: 0 });
    expect(tasksRepository.createQueryBuilder).toHaveBeenCalled();
  });
});
