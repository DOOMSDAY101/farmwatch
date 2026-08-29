import { FarmSimulator } from "./simulator";

const simulator = new FarmSimulator();

for (let i = 0; i < 10; i++) {
    const reading = simulator.generateReading();

    console.log(reading);
}