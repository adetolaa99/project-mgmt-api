import { Test, TestingModule } from '@nestjs/testing';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

describe('TasksController', () => {
  let tasksController: TasksController;
  let tasksService: TasksService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TasksController],
      providers: [
        {
          provide: TasksService,
          useValue: {
            create: jest.fn().mockResolvedValue({ id: 1, title: 'Test Task' }),
            update: jest
              .fn()
              .mockResolvedValue({ id: 1, title: 'Updated Task' }),
            remove: jest.fn().mockResolvedValue({
              message: 'Task 1 was successfully deleted',
            }),
            findAllByProject: jest
              .fn()
              .mockResolvedValue({ tasks: [], total: 0 }),
            findOne: jest.fn().mockResolvedValue({ id: 1, title: 'Test Task' }),
          },
        },
      ],
    }).compile();

    tasksController = module.get<TasksController>(TasksController);
    tasksService = module.get<TasksService>(TasksService);
  });

  it('should create a task', async () => {
    const createDto: CreateTaskDto = { title: 'Test Task' };
    const result = await tasksController.create(1, createDto);

    expect(result).toEqual({ id: 1, title: 'Test Task' });
    expect(tasksService.create).toHaveBeenCalledWith(1, createDto);
  });

  it('should update a task', async () => {
    const updateDto: UpdateTaskDto = { title: 'Updated Task' };
    const result = await tasksController.update(1, updateDto);

    expect(result).toEqual({ id: 1, title: 'Updated Task' });
    expect(tasksService.update).toHaveBeenCalledWith(1, updateDto);
  });

  it('should delete a task', async () => {
    const result = await tasksController.remove(1);

    expect(result).toEqual({ message: 'Task 1 was successfully deleted' });
    expect(tasksService.remove).toHaveBeenCalledWith(1);
  });

  it('should fetch all tasks for a project', async () => {
    const result = await tasksController.findAll(1, 'true', '', 10, 0);
    expect(result).toEqual({ tasks: [], total: 0 });
    expect(tasksService.findAllByProject).toHaveBeenCalled();
  });
});
