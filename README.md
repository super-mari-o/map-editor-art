# Map Editor Art Project

## About

This project is an attempt to reproduce pixel art in the PC game "devast.io".

### Core Idea

In "devast.io", players can place objects on a grid-based map.
Among these objects, there are half-blocks and items that can be rotated 90 degrees,
effectively allowing a single object to represent four distinct pixels.
Additionally, there are larger items that span three grid spaces.
By treating these game assets as pieces of a puzzle, the project formulates the placement process as an optimization problem.
Using an algorithm to solve this problem, the goal is to create pixel art designs on the game's map.

## Technologies Used

This project leverages the following technologies:

- **JavaScript**: The primary language used for development.
- **Volta**: A tool manager to ensure consistent Node.js and npm environments.
- **pnpm**: A fast and efficient package manager.
- **ESLint**: Helps maintain code quality and enforce coding standards.
- **Prettier**: Ensures consistent and clean code formatting.
