import React from 'react'
import { View, Text } from '@tarojs/components'
import styles from './index.module.scss'

interface TagSelectorProps {
    title: string
    options: string[]
    selected: string[]
    multiple?: boolean
    onSelect: (value: string) => void
}

const TagSelector: React.FC<TagSelectorProps> = ({
    title,
    options,
    selected,
    multiple = true,
    onSelect
}) => {
    const handleSelect = (value: string) => {
        if (!multiple) {
            // 单选：如果已选中则取消，否则选中
            onSelect(value)
        } else {
            // 多选：切换选中状态
            onSelect(value)
        }
    }

    const isSelected = (value: string) => selected.includes(value)

    return (
        <View className={styles.tagSelector}>
            <Text className={styles.selectorTitle}>{title}</Text>
            <View className={styles.tagList}>
                {options.map((option) => (
                    <View
                        key={option}
                        className={`${styles.tagItem} ${isSelected(option) ? styles.tagItemSelected : ''}`}
                        onClick={() => handleSelect(option)}
                    >
                        <Text className={styles.tagText}>{option}</Text>
                    </View>
                ))}
            </View>
        </View>
    )
}

export default TagSelector
