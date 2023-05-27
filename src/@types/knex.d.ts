// eslint-disable-next-line
import { knex } from 'knex'

declare module 'knex/types/tables' {
  export interface Tables {
    users: {
      id: string
      session_id?: string
      name: string
      email: string
      created_at: string
    }
    diet_meals: {
      id: string
      id_user: string
      meal_name: string
      meal_description: string
      meal_date: Date
      is_diet_meal: boolean
      created_at: string
      updated_at: string
    }
  }
}
