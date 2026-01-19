import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Calendar, Hammer, DollarSign, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

const statusColors = {
  "مخطط": "bg-slate-100 text-slate-700",
  "قيد التنفيذ": "bg-blue-100 text-blue-700",
  "متوقف": "bg-amber-100 text-amber-700",
  "مكتمل": "bg-emerald-100 text-emerald-700"
};

const priorityColors = {
  "منخفضة": "bg-gray-100 text-gray-600",
  "متوسطة": "bg-yellow-100 text-yellow-700",
  "عالية": "bg-red-100 text-red-700"
};

export default function ProjectCard({ project, onClick }) {
  const completedSteps = project.steps?.filter(s => s.completed)?.length || 0;
  const totalSteps = project.steps?.length || 0;
  const progress = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;

  const purchasedMaterials = project.materials?.filter(m => m.purchased)?.length || 0;
  const totalMaterials = project.materials?.length || 0;

  return (
    <Card 
      className="group cursor-pointer hover:shadow-xl transition-all duration-300 overflow-hidden border-0 bg-white/80 backdrop-blur-sm"
      onClick={() => onClick(project)}
    >
      <div className="relative h-36 bg-gradient-to-br from-indigo-500 to-purple-600 overflow-hidden">
        {project.image_url ? (
          <img 
            src={project.image_url} 
            alt={project.title}
            className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Hammer className="w-16 h-16 text-white/50" />
          </div>
        )}
        <div className="absolute top-3 right-3 flex gap-2">
          <Badge className={statusColors[project.status]}>{project.status}</Badge>
        </div>
        <Badge className={`absolute top-3 left-3 ${priorityColors[project.priority]}`}>
          {project.priority}
        </Badge>
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold text-lg text-slate-800 mb-2 line-clamp-1">{project.title}</h3>
        {project.description && (
          <p className="text-sm text-slate-500 mb-3 line-clamp-2">{project.description}</p>
        )}
        
        {totalSteps > 0 && (
          <div className="mb-3">
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-slate-500">التقدم</span>
              <span className="text-slate-700">{completedSteps}/{totalSteps}</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            {project.target_date && (
              <div className="flex items-center gap-1 text-slate-400">
                <Calendar className="w-4 h-4" />
                <span>{format(new Date(project.target_date), 'd MMM', { locale: ar })}</span>
              </div>
            )}
            {totalMaterials > 0 && (
              <div className="flex items-center gap-1 text-slate-400">
                <CheckCircle2 className="w-4 h-4" />
                <span>{purchasedMaterials}/{totalMaterials} مواد</span>
              </div>
            )}
          </div>
          {project.budget && (
            <div className="flex items-center gap-1 text-emerald-600">
              <DollarSign className="w-4 h-4" />
              <span>{project.budget.toLocaleString()}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}