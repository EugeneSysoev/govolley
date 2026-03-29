declare module "flubber" {
  export interface InterpolateOptions {
    maxSegmentLength?: number;
    string?: boolean;
  }

  /**
   * Создает интерполятор между двумя SVG путями.
   * @param fromPath Исходный path (строка)
   * @param toPath Конечный path (строка)
   * @param options Настройки интерполяции
   * @returns Функция, принимающая t (от 0 до 1) и возвращающая строку пути
   */
  export function interpolate(
    fromPath: string,
    toPath: string,
    options?: InterpolateOptions,
  ): (t: number) => string;

  export function separate(
    fromPath: string,
    toPaths: string[],
    options?: InterpolateOptions,
  ): ((t: number) => string)[];

  export function combine(
    fromPaths: string[],
    toPath: string,
    options?: InterpolateOptions,
  ): ((t: number) => string)[];
}
