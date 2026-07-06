import { prisma } from "../lib/prisma";
import type { Prisma, TemplateCategory } from "@resumeai/db";

export const templateRepository = {
  listActive(category?: TemplateCategory) {
    return prisma.template.findMany({ where: { isActive: true, ...(category ? { category } : {}) }, orderBy: { name: "asc" } });
  },

  listAll() {
    return prisma.template.findMany({ orderBy: { createdAt: "desc" } });
  },

  findBySlug(slug: string) {
    return prisma.template.findUnique({ where: { slug } });
  },

  findById(id: string) {
    return prisma.template.findUnique({ where: { id } });
  },

  create(data: Prisma.TemplateCreateInput) {
    return prisma.template.create({ data });
  },

  update(id: string, data: Prisma.TemplateUpdateInput) {
    return prisma.template.update({ where: { id }, data });
  },

  setActive(id: string, isActive: boolean) {
    return prisma.template.update({ where: { id }, data: { isActive } });
  },
};
