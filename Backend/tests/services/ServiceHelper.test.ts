import { dateToString, stringToDate } from "../../src/services/ServiceHelper";

test.each([
    ["zweistellig", new Date("2023-10-11Z"), "11.10.2023"],
    ["einstellig", new Date("2023-06-01Z"), "01.06.2023"]
])("dateToString %s", (_msg, date, formatted) => {
    expect(dateToString(date)).toEqual(formatted);
});

test.each([
    ["zweistellig", new Date("2023-10-11Z"), "11.10.2023"],
    ["einstellig mit Null", new Date("2023-06-1Z"), "01.06.2023"],
    ["einstellig ohne Null", new Date("2023-06-1Z"), "1.6.2023"]
])("stringToDate %s", (_msg, date, formatted) => {
    expect(stringToDate(formatted).getTime()).toBe(date.getTime());
});

test("dateToString", () => {
    expect(() => dateToString(undefined as any))
        .toThrow("No date provided, cannot convert to string.");
});

test("stringToDate", () => {
    expect(() => stringToDate(undefined as any))
        .toThrow("No date string provided, cannot convert to date.");
});

test("stringToDate invalid format", () => {
    expect(() => stringToDate("2023-10-11"))
        .toThrow("Invalid date format");
});