import dayjs from 'dayjs';
import { useCallback, useState } from 'react';
import { Annotation } from '../types';

export const useAnnotations = (initialAnnotations: Annotation[] = []) => {
  const [annotations, setAnnotations] =
    useState<Annotation[]>(initialAnnotations);

  // 添加批注
  const addAnnotation = useCallback((annotation: Annotation) => {
    setAnnotations((prevAnnotations) => [...prevAnnotations, annotation]);
  }, []);

  // 更新批注
  const updateAnnotation = useCallback(
    (id: string, updates: Partial<Omit<Annotation, 'type'>>) => {
      setAnnotations((prevAnnotations) =>
        prevAnnotations.map((annotation) =>
          annotation.id === id
            ? ({
                ...annotation,
                ...updates,
                modifiedAt: dayjs().format('YYYY-MM-DD HH:mm:ss'), // 更新修改时间
              } as Annotation)
            : annotation,
        ),
      );
    },
    [],
  );

  // 移除批注
  const removeAnnotation = useCallback((id: string) => {
    setAnnotations((prevAnnotations) =>
      prevAnnotations.filter((annotation) => annotation.id !== id),
    );
  }, []);

  // 清空所有批注
  const clearAnnotations = useCallback(() => {
    setAnnotations([]);
  }, []);

  // 按页码过滤批注
  const getAnnotationsByPage = useCallback(
    (pageNumber: number) => {
      return annotations.filter(
        (annotation) => annotation.pageNumber === pageNumber,
      );
    },
    [annotations],
  );

  // 按类型过滤批注
  const getAnnotationsByType = useCallback(
    (type: string) => {
      return annotations.filter((annotation) => annotation.type === type);
    },
    [annotations],
  );

  // 导入批注
  const importAnnotations = useCallback((importedAnnotations: Annotation[]) => {
    setAnnotations(importedAnnotations);
  }, []);

  return {
    annotations,
    addAnnotation,
    updateAnnotation,
    removeAnnotation,
    clearAnnotations,
    getAnnotationsByPage,
    getAnnotationsByType,
    importAnnotations,
  };
};
