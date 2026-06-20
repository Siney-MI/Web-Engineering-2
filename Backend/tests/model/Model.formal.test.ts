import { access, constants, readdir, readFile } from 'fs/promises';
import { join } from 'path';

const listOfFiles: string[] = [];
beforeAll(async () => {
    await Promise.all(
        ["src", "tests"].map(async (dir) => {
            listOfFiles.push(...(await readdir
                (dir, { recursive: true })).map(f => join(dir, f)));
        })
    );
});

test.each([
    join("src", "model", "ProfModel.ts"),
    join("src", "model", "GebietModel.ts"),
    join("src", "model", "ThemaModel.ts"),
    join("tests", "model", "ProfModel.test.ts"),
    join("tests", "model", "GebietModel.test.ts"),
    join("tests", "model", "ThemaModel.test.ts")
])('File "%s" is present', async (filename) => {
    await access(filename, constants.R_OK); // case insensitive
    expect(listOfFiles).toContain(filename); // case sensitive
});

test.each([
    "Prof", "Gebiet", "Thema"
])('Model class "%s" defined and exported', async (domainClassName) => {
    // Better solution but requires ES Module support, which causes problems with Jest
    // const module = await import(`../../src/model/${domainClassName}Model.ts`);
    // const modelClass = module[domainClassName];
    // expect(modelClass).toBeInstanceOf(Function);

    // Not perfect, but works for now
    const moduleFile = await readFile(`src/model/${domainClassName}Model.ts`, 'utf-8');
    const match = moduleFile.match(new RegExp(`export\\s+((const)|(let)|(var))\\s+${domainClassName}\\s+=\\s+model`));
    expect(match).toBeTruthy();
});

