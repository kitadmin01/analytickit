import React, { useState } from 'react'
import { Input, Button, Tag } from 'antd'

interface TileFormProps {
    onSave: (tile: { title: string; description: string; tags: string[] }) => void
    initialValues?: { title: string; description: string; tags: string[] }
}

export const TileForm: React.FC<TileFormProps> = ({ onSave, initialValues }) => {
    const [title, setTitle] = useState(initialValues?.title || '')
    const [description, setDescription] = useState(initialValues?.description || '')
    const [tags, setTags] = useState(initialValues?.tags || [])
    const [newTag, setNewTag] = useState('')

    const addTag = () => {
        setTags([...tags, newTag])
        setNewTag('')
    }

    return (
        <div className="tile-form">
            <Input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
            <Input.TextArea
                placeholder="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
            />
            <div className="tags">
                {tags.map((tag, index) => (
                    <Tag key={index}>{tag}</Tag>
                ))}
                <Input placeholder="New Tag" value={newTag} onChange={(e) => setNewTag(e.target.value)} />
                <Button onClick={addTag}>Add Tag</Button>
            </div>
            <Button onClick={() => onSave({ title, description, tags })}>Save</Button>
        </div>
    )
}
