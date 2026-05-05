import { pipeline, job, step, triggers, Runner } from '@rehearse/ci';
import { bun } from '@rehearse/ci/presets';

export const ci = pipeline('CI', {
  triggers: [triggers.pullRequest(), triggers.push({ branches: ['main'] })],
  jobs: [
    job('test', {
      runner: Runner.ubicloud('standard-4'),
      // bun.build() omitted by default — `bun init` doesn't scaffold a
      // build script. Add it back if your package.json has one.
      steps: [step.checkout(), bun.setup(), bun.install(), bun.test()],
    }),
  ],
});
