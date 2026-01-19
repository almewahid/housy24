import React from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { GripVertical } from 'lucide-react';

export default function DraggableList({ items, onReorder, renderItem, droppableId = 'list' }) {
  const handleDragEnd = (result) => {
    if (!result.destination) return;
    
    const reorderedItems = Array.from(items);
    const [removed] = reorderedItems.splice(result.source.index, 1);
    reorderedItems.splice(result.destination.index, 0, removed);
    
    onReorder(reorderedItems);
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId={droppableId}>
        {(provided) => (
          <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
            {items.map((item, index) => (
              <Draggable key={item.id} draggableId={item.id} index={index}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    className={`flex items-center gap-2 transition-all ${
                      snapshot.isDragging ? 'shadow-lg scale-[1.02] bg-white rounded-xl z-50' : ''
                    }`}
                  >
                    <div 
                      {...provided.dragHandleProps}
                      className="p-2 cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-600"
                    >
                      <GripVertical className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      {renderItem(item, index)}
                    </div>
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}