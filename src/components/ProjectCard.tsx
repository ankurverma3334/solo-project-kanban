
import React, { useState } from 'react';
import { Trash2, Edit2, Check, X } from 'lucide-react';

interface Card {
  id: number;
  title: string;
  description: string;
  createdAt: string;
}

interface ProjectCardProps {
  card: Card;
  onDelete: () => void;
  onUpdate: (updatedCard: Card) => void;
  onDragStart: (e: React.DragEvent) => void;
}

const ProjectCard = ({ card, onDelete, onUpdate, onDragStart }: ProjectCardProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(card.title);
  const [editDescription, setEditDescription] = useState(card.description || '');

  const handleSave = () => {
    if (editTitle.trim()) {
      onUpdate({
        ...card,
        title: editTitle.trim(),
        description: editDescription.trim()
      });
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditTitle(card.title);
    setEditDescription(card.description || '');
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
        <div className="space-y-3">
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Card title"
            autoFocus
          />
          <textarea
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            placeholder="Add a description..."
            rows={3}
          />
          <div className="flex space-x-2">
            <button
              onClick={handleSave}
              className="flex-1 px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors flex items-center justify-center space-x-1"
            >
              <Check className="w-3 h-3" />
              <span>Save</span>
            </button>
            <button
              onClick={handleCancel}
              className="flex-1 px-3 py-1 bg-gray-400 text-white text-sm rounded hover:bg-gray-500 transition-colors flex items-center justify-center space-x-1"
            >
              <X className="w-3 h-3" />
              <span>Cancel</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 cursor-move hover:shadow-md transition-shadow group"
      draggable
      onDragStart={onDragStart}
    >
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-medium text-gray-900 flex-1">{card.title}</h4>
        <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => setIsEditing(true)}
            className="p-1 text-gray-500 hover:text-blue-600 transition-colors"
          >
            <Edit2 className="w-3 h-3" />
          </button>
          <button
            onClick={onDelete}
            className="p-1 text-gray-500 hover:text-red-600 transition-colors"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>
      
      {card.description && (
        <p className="text-gray-600 text-sm mb-3">{card.description}</p>
      )}
      
      <div className="text-xs text-gray-400">
        {new Date(card.createdAt).toLocaleDateString()}
      </div>
    </div>
  );
};

export default ProjectCard;
