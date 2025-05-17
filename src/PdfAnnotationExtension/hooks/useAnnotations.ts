import dayjs from 'dayjs';
import { useCallback, useEffect, useState } from 'react';
import { Annotation } from '../types';

export const useAnnotations = (initialAnnotations: Annotation[] = []) => {
  const [annotations, setAnnotations] =
    useState<Annotation[]>(initialAnnotations);

  // 监控批注状态变化
  useEffect(() => {
    console.log('批注状态更新:', annotations);
  }, [annotations]);

  // 添加批注
  const addAnnotation = useCallback((annotation: Annotation) => {
    console.log('添加批注:', annotation);
    setAnnotations((prevAnnotations) => {
      const newAnnotations = [...prevAnnotations, annotation];
      console.log('更新后的批注列表:', newAnnotations);
      return newAnnotations;
    });
  }, []);

  // 更新批注
  const updateAnnotation = useCallback(
    (id: string, updates: Partial<Omit<Annotation, 'type'>>) => {
      console.log('更新批注:', id, updates);
      setAnnotations((prevAnnotations) => {
        const newAnnotations = prevAnnotations.map((annotation) =>
          annotation.id === id
            ? ({
                ...annotation,
                ...updates,
                modifiedAt: dayjs().format('YYYY-MM-DD HH:mm:ss'), // 更新修改时间
              } as Annotation)
            : annotation,
        );
        console.log('更新后的批注列表:', newAnnotations);
        return newAnnotations;
      });
    },
    [],
  );

  // 移除批注
  const removeAnnotation = useCallback((id: string) => {
    console.log('移除批注:', id);
    setAnnotations((prevAnnotations) => {
      const newAnnotations = prevAnnotations.filter(
        (annotation) => annotation.id !== id,
      );
      console.log('更新后的批注列表:', newAnnotations);
      return newAnnotations;
    });
  }, []);

  // 清空所有批注
  const clearAnnotations = useCallback(() => {
    console.log('清空所有批注');
    setAnnotations([]);
  }, []);

  // 按页码过滤批注
  const getAnnotationsByPage = useCallback(
    (pageNumber: number) => {
      const result = annotations.filter(
        (annotation) => annotation.pageNumber === pageNumber,
      );
      console.log(`获取页码 ${pageNumber} 的批注:`, result);
      return result;
    },
    [annotations],
  );

  // 按类型过滤批注
  const getAnnotationsByType = useCallback(
    (type: string) => {
      const result = annotations.filter(
        (annotation) => annotation.type === type,
      );
      console.log(`获取类型 ${type} 的批注:`, result);
      return result;
    },
    [annotations],
  );

  // 导入批注
  const importAnnotations = useCallback((importedAnnotations: Annotation[]) => {
    console.log('导入批注:', importedAnnotations);
    setAnnotations(importedAnnotations);
  }, []);

  // 批量添加批注
  const addAnnotations = useCallback((newAnnotations: Annotation[]) => {
    console.log('批量添加批注:', newAnnotations);
    setAnnotations((prevAnnotations) => {
      const result = [...prevAnnotations, ...newAnnotations];
      console.log('更新后的批注列表:', result);
      return result;
    });
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
    addAnnotations,
  };
};
