import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { toggleSidebar } from '@/store/slices/uiSlice'
import { HomeWrapper, Subtitle } from './Home.styles'

export const Home = () => {
  const dispatch = useAppDispatch()
  const sidebarOpen = useAppSelector((state) => state.ui.sidebarOpen)

  return (
    <HomeWrapper>
      <Typography variant="h3" component="h1" color="primary" sx={{ fontWeight: 700 }}>
        Home
      </Typography>
      <Subtitle>
        Este proyecto ya tiene React Router, Redux Toolkit, styled-components y MUI configurados
        y listos para usarse.
      </Subtitle>
      <Button variant="contained" onClick={() => dispatch(toggleSidebar())}>
        Sidebar: {sidebarOpen ? 'abierto' : 'cerrado'}
      </Button>
    </HomeWrapper>
  )
}
