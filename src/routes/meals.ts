import { randomUUID } from 'crypto'
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { knex } from '../database.config'

export async function mealsRoutes(app: FastifyInstance) {
  // Define a schema for the request parameters
  const getMealById = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const paramsSchema = z.object({
        id: z.string().uuid(),
        userId: z.string().uuid(),
      })
      // Validate the request parameters
      const { id, userId } = paramsSchema.parse(request.params)

      const meal = await knex('diet_meals')
        .where({
          id,
          id_user: userId,
        })
        .select('*')
        .first()

      if (!meal) return reply.status(404).send({ message: 'Meal not found' })

      return reply.send({ meal })
    } catch (error) {
      console.error(error)
      return reply.status(500).send({ message: 'Internal server error' })
    }
  }

  const getAllUserMeals = async (request: FastifyRequest) => {
    const paramsSchema = z.object({
      id: z.string().uuid(),
    })

    const { id } = paramsSchema.parse(request.params)

    const meals = await knex('diet_meals')
      .where({
        id_user: id,
      })
      .select('*')

    return { meals }
  }

  const postUserMeal = async (request: FastifyRequest, reply: FastifyReply) => {
    const createMealBodySchema = z.object({
      idUser: z.string().uuid(),
      mealName: z.string(),
      mealDescription: z.string(),
      mealDate: z.coerce.date(),
      isDietMeal: z.boolean(),
    })

    const { idUser, mealName, mealDescription, mealDate, isDietMeal } =
      createMealBodySchema.parse(request.body)

    await knex('diet_meals').insert({
      id: randomUUID(),
      id_user: idUser,
      meal_name: mealName,
      meal_description: mealDescription,
      meal_date: mealDate,
      is_diet_meal: isDietMeal,
    })

    return reply.status(201).send()
  }

  const deleteUserMeal = async (
    request: FastifyRequest,
    reply: FastifyReply,
  ) => {
    try {
      const paramsSchema = z.object({
        id: z.string().uuid(),
        userId: z.string().uuid(),
      })
      // Validate the request parameters
      const { id, userId } = paramsSchema.parse(request.params)
      await knex('diet_meals')
        .where({
          id,
          id_user: userId,
        })
        .del()

      return reply.status(204).send()
    } catch (error) {
      console.error(error)
      return reply.status(500).send({ message: 'Internal server error' })
    }
  }

  const editUserMeal = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const editMealBodySchema = z.object({
        mealName: z.string(),
        mealDescription: z.string(),
        mealDate: z.coerce.date(),
        isDietMeal: z.boolean(),
        updatedAt: z.string(),
      })

      const paramsSchema = z.object({
        id: z.string().uuid(),
        userId: z.string().uuid(),
      })
      // Validate the request parameters
      const { id, userId } = paramsSchema.parse(request.params)
      const { mealName, mealDescription, mealDate, isDietMeal, updatedAt } =
        editMealBodySchema.parse(request.body)

      const meal = await knex('diet_meals')
        .where({
          id,
          id_user: userId,
        })
        .update({
          meal_name: mealName,
          meal_description: mealDescription,
          meal_date: mealDate,
          is_diet_meal: isDietMeal,
          updated_at: updatedAt,
        })
        .returning('*')

      return { meal }
    } catch (error) {
      console.error(error)
      return reply.status(500).send({ message: 'Internal server error' })
    }
  }

  // Register the routes
  app.get('/:id/:userId', getMealById)

  app.get('/user/:id', getAllUserMeals)

  app.post('/', postUserMeal)

  app.delete('/:id/:userId', deleteUserMeal)

  app.put('/:id/:userId', editUserMeal)
}
