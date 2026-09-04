
export default interface Todo {
    id: string,
    user_id: string,
    text: string,
    position: number,
    completed:boolean,
    created_at: Date
}