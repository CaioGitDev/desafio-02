import { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('diet_meals', (table) => {
    table.uuid('id').primary()
    table.uuid('id_user').notNullable()
    table.foreign('id_user').references('id').inTable('users')
    table.text('meal_name').notNullable()
    table.text('meal_description').notNullable()
    table.dateTime('meal_date').notNullable()
    table.boolean('is_diet_meal').notNullable()
    table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable()
    table.timestamp('updated_at')
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('diet_meals')
}
