<?php

namespace Database\Factories;

use App\Models\Story;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Character>
 */
class CharacterFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $characterTypes = [
            'Hero' => [
                'Brave and determined protagonist',
                'Reluctant hero with a troubled past',
                'Charismatic leader with a strong moral compass',
                'Ordinary person thrust into extraordinary circumstances',
                'Skilled warrior with a secret vulnerability'
            ],
            'Villain' => [
                'Calculating mastermind with a tragic backstory',
                'Power-hungry antagonist with no moral boundaries',
                'Charming manipulator with hidden agendas',
                'Former ally turned enemy through betrayal',
                'Misunderstood character with complex motivations'
            ],
            'Sidekick' => [
                'Loyal friend providing comic relief',
                'Intelligent assistant with crucial knowledge',
                'Skilled partner complementing the hero\'s abilities',
                'Apprentice learning from the main character',
                'Unexpected ally from an opposing faction'
            ],
            'Mentor' => [
                'Wise elder with ancient knowledge',
                'Tough trainer with unconventional methods',
                'Former hero passing on their legacy',
                'Mysterious guide with their own agenda',
                'Supportive figure with a dark secret'
            ],
            'Love Interest' => [
                'Childhood friend with unresolved feelings',
                'Rival turned romantic partner',
                'Mysterious stranger with an intriguing past',
                'Forbidden love from an enemy faction',
                'Supportive partner facing their own challenges'
            ]
        ];

        $type = $this->faker->randomElement(array_keys($characterTypes));
        $description = $this->faker->randomElement($characterTypes[$type]);

        return [
            'name' => $this->faker->name() . ' the ' . $type,
            'story_id' => Story::inRandomOrder()->first()->id,
            'description' => $description . '. ' . $this->faker->paragraph(3),
        ];
    }
}
